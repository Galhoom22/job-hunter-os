#!/usr/bin/env node
// Zero-dependency cross-platform installer & DX CLI for job-hunter-os.
// Uses Node.js built-in modules only.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';

const SOURCE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOME = os.homedir();
const ARGV = process.argv.slice(2);

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, msg) => (useColor ? `\x1b[${code}m${msg}\x1b[0m` : msg);
const ok = msg => console.log(paint('32', `[✓] ${msg}`));
const warn = msg => console.log(paint('33', `[!] ${msg}`));
const info = msg => console.log(paint('36', `[i] ${msg}`));
const fail = msg => console.error(paint('31', `[✗] ${msg}`));

// ---------------- CLI args ----------------
const BOOLEAN_FLAGS = new Set(['--global', '-g', '--help', '-h', '--strict', '--yes', '-y', '--no-open']);
const positional = [];
const opts = { global: false, ide: 'all', help: false, strict: false, noOpen: false };
let argErr = null;

for (let i = 0; i < ARGV.length; i++) {
  const a = ARGV[i];
  if (a === '--global' || a === '-g') opts.global = true;
  else if (a === '--help' || a === '-h') opts.help = true;
  else if (a === '--strict') opts.strict = true;
  else if (a === '--yes' || a === '-y') opts.yes = true;
  else if (a === '--no-open') opts.noOpen = true;
  else if (a === '--ide') {
    const val = ARGV[++i];
    if (!val || val.startsWith('-')) argErr = '--ide requires an IDE name (e.g., all, claude, cursor, antigravity, codex, opencode, windsurf, devin, cline).';
    else opts.ide = val.toLowerCase();
  } else if (a.startsWith('--ide=')) {
    const val = a.slice(6).toLowerCase();
    if (!val) argErr = '--ide= requires a value.';
    else opts.ide = val;
  } else if (a.startsWith('-')) {
    argErr = `Unknown option: ${a}. Run with --help for usage.`;
  } else {
    positional.push(a);
  }
}

const command = positional[0] || (opts.help ? 'help' : 'help');

function resolveRoot() {
  const globalRoot = path.join(HOME, '.job-hunter-os');
  if (opts.global) return globalRoot;
  if (command === 'init') return process.cwd();
  if (fs.existsSync(path.join(process.cwd(), '.job-hunter-install.json'))) return process.cwd();
  if (fs.existsSync(path.join(globalRoot, '.job-hunter-install.json'))) return globalRoot;
  return process.cwd();
}

const ROOT = resolveRoot();

// ---------------- FS safety helpers ----------------
function isObj(v) {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function refuseSymlink(target, boundary = null) {
  let cursor = path.resolve(target);
  const stop = boundary ? path.resolve(boundary) : null;
  while (true) {
    // On macOS, /var and /tmp are system symlinks; stop once we reach the user/workspace boundary.
    if (process.platform === 'darwin' && (cursor === '/var' || cursor === '/tmp')) return;
    let stat;
    try { stat = fs.lstatSync(cursor); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (stat?.isSymbolicLink()) {
      throw new Error(`Refusing symbolic-link destination: ${cursor}`);
    }
    if (stop && cursor === stop) return;
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
}

function writeAtomic(file, content, { preserve = false, mode = 0o644 } = {}) {
  refuseSymlink(file);
  if (preserve && fs.existsSync(file)) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
  fs.writeFileSync(tmp, content, { flag: 'wx', mode });
  try {
    fs.renameSync(tmp, file);
    if (process.platform !== 'win32') {
      try { fs.chmodSync(file, mode); } catch { /* ignore */ }
    }
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
  return true;
}

function copyTree(from, to, { preserve = false, filter = () => true } = {}) {
  if (!fs.existsSync(from)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || !filter(entry.name)) continue;
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) {
      count += copyTree(src, dst, { preserve, filter });
    } else if (entry.isFile()) {
      if (writeAtomic(dst, fs.readFileSync(src), { preserve })) count++;
    }
  }
  return count;
}

function ensurePrivateGitignore(root) {
  const ignoreFile = path.join(root, '.gitignore');
  const marker = '# Job Hunter OS private runtime';
  const block = [
    '',
    marker,
    'browser-profile/',
    '.env',
    '.env.*',
    '!.env.example',
    '.mcp.json',
    '.cursor/mcp.json',
    '/mcp/*.import.json',
    '/assets/*.pdf',
    '/context/*.pdf',
    '/context/*',
    '!/context/*.example',
    '!/context/DROP_YOUR_FILES_HERE.md',
    '/logs/',
  ].join('\n') + '\n';
  if (!fs.existsSync(ignoreFile)) {
    writeAtomic(ignoreFile, block.trimStart());
    return;
  }
  const current = fs.readFileSync(ignoreFile, 'utf8');
  if (!current.includes(marker) && !current.includes('browser-profile/')) {
    writeAtomic(ignoreFile, current.trimEnd() + '\n' + block);
  }
}

// ---------------- IDE skill injection ----------------
const SUPPORTED_IDES = new Set(['all', 'antigravity', 'claude', 'cursor', 'codex', 'opencode', 'windsurf', 'devin', 'cline']);

function installIdeSkills(srcRoot, targetRoot, { isGlobal, ide, preserve = false }) {
  if (!SUPPORTED_IDES.has(ide)) {
    throw new Error(`Unsupported --ide "${ide}". Use: ${[...SUPPORTED_IDES].join(', ')}`);
  }
  const want = name => ide === 'all' || ide === name;
  let written = 0;

  if (isGlobal) {
    // Universal agentskills.io auto-discovery (~/.agents/skills/) for Codex, OpenCode, Goose, Amp, Zed
    if (want('codex') || want('opencode')) {
      written += copyTree(path.join(srcRoot, '.agents', 'skills'), path.join(HOME, '.agents', 'skills'), { preserve });
    }
    // Claude Code global skills & commands (~/.claude/skills/, ~/.claude/commands/)
    if (want('claude')) {
      written += copyTree(path.join(srcRoot, '.agents', 'skills'), path.join(HOME, '.claude', 'skills'), { preserve });
      written += copyTree(path.join(srcRoot, 'commands'), path.join(HOME, '.claude', 'commands'), { preserve });
    }
    // Antigravity global workflows & skills (~/.gemini/antigravity/global_workflows/, ~/.antigravity/skills/)
    if (want('antigravity')) {
      written += copyTree(path.join(srcRoot, '.agent', 'workflows'), path.join(HOME, '.gemini', 'antigravity', 'global_workflows'), { preserve });
      written += copyTree(path.join(srcRoot, 'skills'), path.join(HOME, '.antigravity', 'skills'), { preserve });
    }
    // Cursor global rule (~/.cursor/rules/job-hunter.mdc)
    if (want('cursor')) {
      const ruleText = [
        '---',
        'description: Job Hunter OS global instructions and progressive disclosure entry',
        'alwaysApply: false',
        '---',
        '',
        `For job-hunting workflows, read \`${path.join(targetRoot, 'AGENTS.md')}\` and \`${path.join(targetRoot, 'skills', 'REGISTRY.md')}\` first.`,
        `Resolve context, logs, and templates inside \`${targetRoot}\`.`,
        'Respect dry run, verified facts only, Days 1-3 warm-up caps, and explicit owner APPROVE before Submit/Save/Send.',
        '',
      ].join('\n');
      if (writeAtomic(path.join(HOME, '.cursor', 'rules', 'job-hunter.mdc'), ruleText, { preserve })) written++;
    }
    // Devin Desktop / Windsurf global rules & workflows (~/.windsurf/)
    if (want('windsurf') || want('devin')) {
      const ruleText = `For job-hunting workflows, read ${path.join(targetRoot, 'AGENTS.md')} and ${path.join(targetRoot, 'skills', 'REGISTRY.md')} first. Agent home: ${targetRoot}.\n`;
      if (writeAtomic(path.join(HOME, '.windsurf', 'rules', 'job-hunter.md'), ruleText, { preserve })) written++;
      written += copyTree(path.join(srcRoot, '.agent', 'workflows'), path.join(HOME, '.windsurf', 'workflows'), { preserve });
    }
    // Cline global rule (~/.clinerules/job-hunter.md)
    if (want('cline')) {
      const ruleText = `For job-hunting workflows, read ${path.join(targetRoot, 'AGENTS.md')} and ${path.join(targetRoot, 'skills', 'REGISTRY.md')} first. Agent home: ${targetRoot}.\n`;
      if (writeAtomic(path.join(HOME, '.clinerules', 'job-hunter.md'), ruleText, { preserve })) written++;
    }
  } else {
    // Local project mode: ensure .agents/skills, .agent/workflows, .cursor/rules, .windsurfrules, .clinerules exist
    written += copyTree(path.join(srcRoot, '.agents', 'skills'), path.join(targetRoot, '.agents', 'skills'), { preserve });
    written += copyTree(path.join(srcRoot, '.agent', 'workflows'), path.join(targetRoot, '.agent', 'workflows'), { preserve });
    written += copyTree(path.join(srcRoot, 'commands'), path.join(targetRoot, 'commands'), { preserve });
    written += copyTree(path.join(srcRoot, '.cursor'), path.join(targetRoot, '.cursor'), { preserve: true });
    written += copyTree(path.join(srcRoot, '.github', 'prompts'), path.join(targetRoot, '.github', 'prompts'), { preserve: true });
    for (const f of ['.windsurfrules', '.clinerules', '.goosehints', '.rules', '.aider.conf.yml', 'opencode.json']) {
      const s = path.join(srcRoot, f);
      if (fs.existsSync(s) && writeAtomic(path.join(targetRoot, f), fs.readFileSync(s), { preserve: true })) written++;
    }
  }
  return written;
}

// ---------------- MCP merge ----------------
function readJsonSafe(file) {
  refuseSymlink(file);
  if (!fs.existsSync(file)) return {};
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    throw new Error(`Invalid JSON in ${file}; refusing to overwrite.`);
  }
  if (!isObj(parsed)) throw new Error(`Unsupported JSON root in ${file}; expected object.`);
  return parsed;
}

function mcpTargetFiles(root, isGlobal) {
  if (isGlobal) {
    return [
      path.join(HOME, '.claude.json'),
      path.join(HOME, '.cursor', 'mcp.json'),
      path.join(HOME, '.gemini', 'antigravity', 'mcp_config.json'),
      path.join(HOME, '.codeium', 'windsurf', 'mcp_config.json'),
    ];
  }
  return [
    path.join(root, '.mcp.json'),
    path.join(root, '.cursor', 'mcp.json'),
  ];
}

function syncMcp({ root = ROOT, isGlobal = opts.global || ROOT === path.join(HOME, '.job-hunter-os'), src = SOURCE } = {}) {
  const templatePath = [path.join(root, 'mcp', 'mcp.template.json'), path.join(src, 'mcp', 'mcp.template.json')].find(f => fs.existsSync(f));
  if (!templatePath) throw new Error('mcp/mcp.template.json not found. Run init first.');
  const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  const tplPlaywright = template?.mcpServers?.playwright;
  if (!isObj(tplPlaywright) || !Array.isArray(tplPlaywright.args)) {
    throw new Error('Invalid mcp/mcp.template.json playwright server definition.');
  }

  const profileDir = path.join(root, 'browser-profile');
  const playwrightCfg = {
    ...tplPlaywright,
    args: tplPlaywright.args.map(a => (a.startsWith('--user-data-dir=') ? `--user-data-dir=${profileDir}` : a)),
  };
  if (!playwrightCfg.args.some(a => a.startsWith('--user-data-dir='))) {
    playwrightCfg.args.push(`--user-data-dir=${profileDir}`);
  }

  const targets = mcpTargetFiles(root, isGlobal);
  let updated = 0;

  for (const file of targets) {
    const current = readJsonSafe(file);
    const servers = isObj(current.mcpServers) ? { ...current.mcpServers } : {};
    if (servers.playwright && JSON.stringify(servers.playwright) !== JSON.stringify(playwrightCfg)) {
      warn(`Preserved existing custom playwright MCP server in ${file}`);
      continue;
    }
    servers.playwright = playwrightCfg;
    if (process.env.NOTION_TOKEN && template.mcpServers?.notion && !servers.notion) {
      servers.notion = template.mcpServers.notion;
    }
    const nextText = JSON.stringify({ ...current, mcpServers: servers }, null, 2) + '\n';
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === nextText) continue;
    writeAtomic(file, nextText, { mode: 0o600 });
    updated++;
    ok(`Synced Playwright MCP -> ${file}`);
  }

  // Write opt-in Notion staging import file without secrets
  if (template.mcpServers?.notion) {
    writeAtomic(
      path.join(root, 'mcp', 'notion.import.json'),
      JSON.stringify({ mcpServers: { notion: template.mcpServers.notion } }, null, 2) + '\n',
      { preserve: true, mode: 0o600 },
    );
  }
  if (!updated) info('MCP configurations already up to date.');
}

// ---------------- init ----------------
const SCAFFOLD_DIRS = ['skills', 'adapters', 'templates', 'config', 'schemas', 'prompts', 'docs', 'mcp'];
const ROOT_MD_FILES = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'WARP.md', 'CRUSH.md', 'LICENSE'];

function scaffoldFrom(srcRoot, targetRoot, { isUpdate = false } = {}) {
  refuseSymlink(targetRoot);
  fs.mkdirSync(targetRoot, { recursive: true });

  // Copy/refresh playbooks & templates (preserve config/guardrails.yaml on existing installs)
  for (const dir of SCAFFOLD_DIRS) {
    copyTree(path.join(srcRoot, dir), path.join(targetRoot, dir), {
      preserve: isUpdate ? dir === 'config' : dir === 'config',
      filter: name => !name.includes('import.json'),
    });
  }
  for (const name of ROOT_MD_FILES) {
    const s = path.join(srcRoot, name);
    if (fs.existsSync(s)) writeAtomic(path.join(targetRoot, name), fs.readFileSync(s), { preserve: false });
  }

  // Never overwrite user context/ files! Only populate missing files from .example
  const srcCtx = path.join(srcRoot, 'context');
  const dstCtx = path.join(targetRoot, 'context');
  if (fs.existsSync(srcCtx)) {
    for (const name of fs.readdirSync(srcCtx)) {
      if (name.endsWith('.example')) {
        const buf = fs.readFileSync(path.join(srcCtx, name));
        writeAtomic(path.join(dstCtx, name), buf, { preserve: false });
        writeAtomic(path.join(dstCtx, name.replace(/\.example$/, '')), buf, { preserve: true });
      }
    }
    const drop = path.join(srcCtx, 'DROP_YOUR_FILES_HERE.md');
    if (fs.existsSync(drop)) writeAtomic(path.join(dstCtx, 'DROP_YOUR_FILES_HERE.md'), fs.readFileSync(drop), { preserve: true });
  }

  // Ensure runtime directories & starter logs (preserve existing logs)
  for (const d of ['logs/runs', 'logs/resumes', 'logs/screenshots', 'logs/insights', 'logs/exports', 'logs/backups', 'assets', 'browser-profile']) {
    const p = path.join(targetRoot, d);
    refuseSymlink(p);
    fs.mkdirSync(p, { recursive: true });
  }
  writeAtomic(path.join(targetRoot, 'logs', 'applications-log.json'), '[]\n', { preserve: true, mode: 0o600 });
  writeAtomic(path.join(targetRoot, 'logs', 'skipped-jobs.json'), '[]\n', { preserve: true, mode: 0o600 });
  writeAtomic(path.join(targetRoot, 'logs', 'circuit-breaker.json'), '{\n  "platforms": {}\n}\n', { preserve: true, mode: 0o600 });
  ensurePrivateGitignore(targetRoot);
  installGitPreCommitHook(targetRoot);
}

function installGitPreCommitHook(root) {
  const gitDir = path.join(root, '.git');
  try {
    if (!fs.existsSync(gitDir) || !fs.lstatSync(gitDir).isDirectory()) return false;
  } catch {
    return false;
  }
  const hookFile = path.join(gitDir, 'hooks', 'pre-commit');
  const marker = '# job-hunter-os pre-commit pii shield';
  if (fs.existsSync(hookFile)) {
    try {
      const existing = fs.readFileSync(hookFile, 'utf8');
      if (!existing.includes(marker)) return true; // preserve custom user hook
    } catch {
      return false;
    }
  }
  const script = [
    '#!/usr/bin/env sh',
    marker,
    'set -e',
    'STAGED=$(git diff --cached --name-only --diff-filter=ACM || true)',
    'if [ -z "$STAGED" ]; then exit 0; fi',
    'for f in $STAGED; do',
    '  case "$f" in',
    '    context/*.example|context/DROP_YOUR_FILES_HERE.md) ;;',
    '    context/*|logs/*|browser-profile/*|*.pdf|.env|.env.*|.mcp.json|.cursor/mcp.json)',
    '      echo "[job-hunter-os PII Shield] BLOCKED commit of private file: $f" >&2',
    '      exit 1',
    '      ;;',
    '  esac',
    'done',
    'if git diff --cached -U0 | grep -E "^\\+.*(ntn_[A-Za-z0-9]{12,}|sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})" >/dev/null 2>&1; then',
    '  echo "[job-hunter-os PII Shield] BLOCKED commit containing an API token signature (ntn_ / sk- / ghp_)." >&2',
    '  exit 1',
    'fi',
    'exit 0',
    '',
  ].join('\n');
  writeAtomic(hookFile, script, { preserve: false, mode: 0o755 });
  return true;
}

function cmdInit() {
  const isGlobal = opts.global;
  scaffoldFrom(SOURCE, ROOT, { isUpdate: false });
  writeAtomic(
    path.join(ROOT, '.job-hunter-install.json'),
    JSON.stringify({ version: 1, scope: isGlobal ? 'global' : 'local', installed_at: new Date().toISOString() }, null, 2) + '\n',
    { preserve: true },
  );
  const ideFiles = installIdeSkills(SOURCE, ROOT, { isGlobal, ide: opts.ide, preserve: false });
  syncMcp({ root: ROOT, isGlobal, src: SOURCE });
  ok(`Initialized job-hunter-os (${isGlobal ? 'global' : 'local'}) at ${ROOT} (${ideFiles} IDE skill/rule file(s) synced).`);
  info('Next: run `login`, close the browser, open your IDE and type `/setup` to verify your CV and preferences.');
}

// ---------------- update ----------------
function cmdUpdate() {
  const isGlobal = opts.global || ROOT === path.join(HOME, '.job-hunter-os');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'job-hunter-update-'));
  try {
    let srcRoot = SOURCE;
    const repoDir = path.join(temp, 'repo');
    info('Fetching latest job-hunter-os playbooks from GitHub...');
    const clone = spawnSync(
      'git',
      ['clone', '--depth', '1', 'https://github.com/redasalem/job-hunter-os.git', repoDir],
      { stdio: 'pipe', timeout: 60000, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } },
    );
    if (clone.status === 0 && fs.existsSync(path.join(repoDir, 'AGENTS.md'))) {
      srcRoot = repoDir;
    } else {
      warn('Could not reach GitHub via git; refreshing from local package copy instead.');
    }

    scaffoldFrom(srcRoot, ROOT, { isUpdate: true });
    // Also refresh bin/ & scripts/ if target is ~/.job-hunter-os
    if (path.resolve(ROOT) !== path.resolve(srcRoot)) {
      copyTree(path.join(srcRoot, 'bin'), path.join(ROOT, 'bin'), { preserve: false });
      copyTree(path.join(srcRoot, 'scripts'), path.join(ROOT, 'scripts'), { preserve: false });
    }
    const ideFiles = installIdeSkills(srcRoot, ROOT, { isGlobal, ide: opts.ide, preserve: false });
    ok(`Updated skills, adapters, templates, and AGENTS.md at ${ROOT} (${ideFiles} IDE file(s) refreshed).`);
    info('Preserved your private context/, logs/, config/guardrails.yaml, assets/, and browser-profile/.');
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

// ---------------- doctor ----------------
const PLACEHOLDER_RE = /\b(?:Jane Doe|John Doe|YOUR_NAME|YOUR_EMAIL|your-handle|your-site|replace-with|Acme Fintech|Nile Commerce)\b|(?:example\.com|example\.invalid|reda@example\.com)/i;

function isPopulated(root, relPath) {
  const file = path.join(root, relPath);
  if (!fs.existsSync(file)) return { exists: false, ready: false };
  const text = fs.readFileSync(file, 'utf8');
  const ex = path.join(root, `${relPath}.example`);
  const sameAsEx = fs.existsSync(ex) && text === fs.readFileSync(ex, 'utf8');
  const ready = text.trim().length > 20 && !sameAsEx && !PLACEHOLDER_RE.test(text);
  return { exists: true, ready };
}

function extractProfileUrls(root) {
  const urls = new Set();
  for (const rel of ['context/profile.md', 'context/resume-data.json']) {
    const f = path.join(root, rel);
    if (!fs.existsSync(f)) continue;
    const text = fs.readFileSync(f, 'utf8');
    const matches = text.match(/https?:\/\/[^\s)"'>\],]+/gi) || [];
    for (const raw of matches) {
      const cleaned = raw.replace(/[.;:]+$/, '');
      if (cleaned) urls.add(cleaned);
    }
  }
  return [...urls];
}

async function verifyProfileLinks(root, isProfileReady) {
  const urls = extractProfileUrls(root);
  if (!urls.length) {
    return { validSyntax: 0, placeholderCount: 0, deadUrls: [], checkedReachable: 0 };
  }
  let validSyntax = 0;
  let placeholderCount = 0;
  let checkedReachable = 0;
  const deadUrls = [];

  for (const u of urls) {
    let parsed;
    try {
      parsed = new URL(u);
      validSyntax++;
    } catch {
      deadUrls.push(`${u} (malformed URL)`);
      continue;
    }
    if (PLACEHOLDER_RE.test(u) || /example\.|your-handle|your-site/i.test(parsed.hostname)) {
      placeholderCount++;
      continue;
    }
    if (isProfileReady && typeof fetch === 'function' && !process.env.CI) {
      checkedReachable++;
      try {
        let res = await fetch(u, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(3500),
          headers: { 'User-Agent': 'job-hunter-os-link-check/1.0' },
        });
        if (res.status === 405 || res.status === 403) {
          res = await fetch(u, {
            method: 'GET',
            redirect: 'follow',
            signal: AbortSignal.timeout(3500),
            headers: { 'User-Agent': 'job-hunter-os-link-check/1.0' },
          });
        }
        if (res.status === 404 || res.status === 410 || res.status >= 500) {
          deadUrls.push(`${u} (HTTP ${res.status})`);
        }
      } catch {
        deadUrls.push(`${u} (unreachable)`);
      }
    }
  }
  return { validSyntax, placeholderCount, deadUrls, checkedReachable, total: urls.length };
}

function evaluateGates(root) {
  const prof = isPopulated(root, 'context/profile.md');
  const cv = isPopulated(root, 'context/cv.md');
  const hasPdf = ['assets/resume.pdf', 'context/resume.pdf'].some(rel => {
    const f = path.join(root, rel);
    try { return fs.existsSync(f) && fs.readFileSync(f).subarray(0, 5).toString() === '%PDF-'; } catch { return false; }
  });
  const g1 = prof.ready && cv.ready && hasPdf;
  const g2 = isPopulated(root, 'context/preferences.yaml').ready;
  const ansFile = path.join(root, 'context', 'form-answers.yaml');
  const ans = isPopulated(root, 'context/form-answers.yaml');
  const ownerVerified = fs.existsSync(ansFile) && /^owner_verified:\s*true\s*(?:#.*)?$/m.test(fs.readFileSync(ansFile, 'utf8'));
  const g3 = ans.ready && ownerVerified;
  const g4 = g3;
  const targetsFile = path.join(root, 'context', 'targets.yaml');
  const g5 = fs.existsSync(targetsFile) && /^\s+enabled:\s*true\s*(?:#.*)?$/m.test(fs.readFileSync(targetsFile, 'utf8'));
  const passed = [g1, g2, g3, g4, g5].filter(Boolean).length;
  return { g1, g2, g3, g4, g5, passed, profReady: prof.ready };
}

async function cmdDoctor() {
  let criticalFailures = 0;
  let readinessPending = 0;
  const isGlobal = opts.global || ROOT === path.join(HOME, '.job-hunter-os');

  console.log(paint('36', `\nJob Hunter OS Doctor — ${ROOT}\n`));

  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor >= 18) ok(`OS & Runtime: ${process.platform} (${os.arch()}) · Node ${process.versions.node}`);
  else { fail(`Node.js 18+ required (found ${process.versions.node})`); criticalFailures++; }

  const installed = fs.existsSync(path.join(ROOT, '.job-hunter-install.json')) || fs.existsSync(path.join(ROOT, 'AGENTS.md'));
  if (installed) ok(`Agent Home: ${ROOT} (${isGlobal ? 'global' : 'local'})`);
  else { fail(`Agent Home not initialized at ${ROOT}; run \`init\``); criticalFailures++; }

  if (fs.existsSync(path.join(ROOT, 'skills', 'REGISTRY.md'))) ok('Skill Registry: skills/REGISTRY.md present');
  else { fail('Missing skills/REGISTRY.md'); criticalFailures++; }

  // Readiness gates (warning unless --strict)
  const checkGate = (label, cond, hint) => {
    if (cond) ok(label);
    else { warn(`${label} — ${hint}`); readinessPending++; }
  };

  const gates = evaluateGates(ROOT);
  checkGate('Gate 1 · CV & Profile', gates.g1, 'run /setup in your IDE to confirm CV & add resume.pdf');
  checkGate('Gate 2 · Target Preferences', gates.g2, 'confirm target roles, regions & work modes in /setup');
  checkGate('Gate 3/4 · Legal, Comp & Skills', gates.g3, 'confirm salary, visa, and skill years in /setup');
  checkGate('Gate 5 · Enabled Targets', gates.g5, 'enable at least one board in context/targets.yaml via /setup');

  // Profile & Resume Live Link Verifier
  const linkAudit = await verifyProfileLinks(ROOT, gates.profReady);
  if (linkAudit.deadUrls.length > 0) {
    warn(`Profile & Resume Links: ${linkAudit.deadUrls.length} broken/dead URL(s): ${linkAudit.deadUrls.join(', ')}`);
    readinessPending++;
  } else if (linkAudit.placeholderCount > 0) {
    info(`Profile & Resume Links: ${linkAudit.placeholderCount} placeholder URL(s) in context/ (replace via /setup)`);
  } else if (linkAudit.validSyntax > 0) {
    ok(`Profile & Resume Links: ${linkAudit.validSyntax} well-formed URL(s) verified`);
  }

  const profileExists = fs.existsSync(path.join(ROOT, 'browser-profile'));
  checkGate('Browser Profile Directory', profileExists, 'run `login` to initialize browser-profile/');

  if (installGitPreCommitHook(ROOT)) {
    ok('Git Pre-Commit PII Shield: .git/hooks/pre-commit active');
  }

  // MCP configs
  for (const file of mcpTargetFiles(ROOT, isGlobal)) {
    if (!fs.existsSync(file)) {
      info(`MCP Config: ${file} (not created yet — run sync-mcp if using this IDE)`);
      continue;
    }
    try {
      const cfg = readJsonSafe(file);
      const args = cfg?.mcpServers?.playwright?.args || [];
      const hasDir = Array.isArray(args) && args.some(a => typeof a === 'string' && a.startsWith('--user-data-dir='));
      if (hasDir) ok(`MCP Config: ${file}`);
      else { warn(`MCP Config: ${file} missing playwright --user-data-dir`); readinessPending++; }
    } catch (e) {
      fail(`MCP Config invalid JSON: ${file}`);
      criticalFailures++;
    }
  }

  // Global IDE discovery folders (informational)
  if (isGlobal) {
    for (const [label, p] of [
      ['~/.agents/skills', path.join(HOME, '.agents', 'skills')],
      ['~/.claude/skills', path.join(HOME, '.claude', 'skills')],
      ['~/.cursor/rules/job-hunter.mdc', path.join(HOME, '.cursor', 'rules', 'job-hunter.mdc')],
      ['~/.gemini/antigravity/global_workflows', path.join(HOME, '.gemini', 'antigravity', 'global_workflows')],
    ]) {
      if (fs.existsSync(p)) ok(`Global IDE Path: ${label}`);
      else warn(`Global IDE Path missing: ${label} (run init --global)`);
    }
  }

  info(`Optional NOTION_TOKEN: ${process.env.NOTION_TOKEN ? 'present (value hidden)' : 'not set (local JSON mode active)'}`);
  if (readinessPending > 0) {
    console.log('');
    info(`${readinessPending} setup item(s) pending. Open ${ROOT} in your AI IDE and type /setup.`);
  }
  if (criticalFailures > 0 || (opts.strict && readinessPending > 0)) process.exitCode = 1;
}

// ---------------- login ----------------
function findBrowser() {
  const winPF = process.env.PROGRAMFILES || 'C:\\Program Files';
  const winPF86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
  const winLocal = process.env.LOCALAPPDATA || HOME;
  const candidates = process.platform === 'win32'
    ? [
        path.join(winPF, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(winPF86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(winLocal, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(winPF, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        path.join(winPF86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      ]
    : process.platform === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
          '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        ]
      : [
          '/usr/bin/google-chrome',
          '/usr/bin/chromium',
          '/usr/bin/chromium-browser',
          '/snap/bin/chromium',
          '/opt/google/chrome/chrome',
        ];
  return candidates.find(p => fs.existsSync(p)) || null;
}

function cmdLogin() {
  const profile = path.join(ROOT, 'browser-profile');
  refuseSymlink(profile);
  fs.mkdirSync(profile, { recursive: true });
  for (const lockName of ['SingletonLock', 'SingletonCookie']) {
    if (fs.existsSync(path.join(profile, lockName))) {
      throw new Error('Browser profile is currently locked by another running browser/Playwright session. Close it first.');
    }
  }
  const browser = findBrowser();
  if (!browser) {
    throw new Error('No Chrome/Chromium/Edge binary found. Install Chrome or ask Playwright MCP to open a headed browser during /setup.');
  }
  const urls = ['https://www.linkedin.com/login', 'https://wellfound.com/login', 'https://wuzzuf.net/login'];
  const child = spawn(browser, [`--user-data-dir=${profile}`, '--no-first-run', '--new-window', ...urls], {
    detached: true,
    stdio: 'ignore',
  });
  child.on('error', err => {
    fail(`Browser launch failed: ${err.message}`);
    process.exitCode = 1;
  });
  child.unref();
  ok(`Opened browser with persistent profile: ${profile}`);
  info('Log in manually to LinkedIn, Wellfound, and Wuzzuf, then close the browser window before starting Playwright MCP.');
}

function readApplicationsLog(root) {
  const logFile = path.join(root, 'logs', 'applications-log.json');
  if (!fs.existsSync(logFile)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    if (Array.isArray(parsed)) return parsed;
    if (isObj(parsed) && Array.isArray(parsed.applications)) return parsed.applications;
  } catch { /* ignore invalid JSON */ }
  return [];
}

function cmdStatus() {
  const gates = evaluateGates(ROOT);
  const stateFile = path.join(ROOT, 'context', 'readiness-state.json');
  let stateReady = false;
  if (fs.existsSync(stateFile)) {
    try {
      const st = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      stateReady = Boolean(st?.overall_ready);
    } catch { /* ignore */ }
  }
  const gateScore = stateReady ? 5 : gates.passed;

  // Read config/guardrails.yaml
  const guardFile = [path.join(ROOT, 'config', 'guardrails.yaml'), path.join(SOURCE, 'config', 'guardrails.yaml')].find(f => fs.existsSync(f));
  let maxPerDay = 15;
  let dryRun = true;
  if (guardFile) {
    const gText = fs.readFileSync(guardFile, 'utf8');
    const mCap = gText.match(/max_applications_per_day:\s*(\d+)/);
    if (mCap) maxPerDay = Number(mCap[1]);
    const mDry = gText.match(/^\s*dry_run:\s*(true|false)/m);
    if (mDry) dryRun = mDry[1] === 'true';
  }

  const records = readApplicationsLog(ROOT);
  const todayStr = new Date().toISOString().slice(0, 10);
  const runDates = new Set();
  let todayApplied = 0;
  let totalApplied = 0;
  let interviewing = 0;
  let assessment = 0;
  let offers = 0;
  let rejected = 0;
  const platStats = new Map();

  for (const r of records) {
    const status = String(r?.status || '').toLowerCase();
    const datePrefix = String(r?.applied_at || r?.date || '').slice(0, 10);
    if (status === 'dry_run' || status === 'skipped' || status === 'aborted' || status === 'needs_review') continue;

    totalApplied++;
    if (datePrefix) runDates.add(datePrefix);
    if (datePrefix === todayStr) todayApplied++;

    const plat = String(r?.platform || 'direct').toLowerCase();
    if (!platStats.has(plat)) platStats.set(plat, { submitted: 0, callbacks: 0 });
    const ps = platStats.get(plat);
    ps.submitted++;

    if (status.includes('offer') || status === 'hired') {
      offers++;
      ps.callbacks++;
    } else if (status.includes('assess') || status.includes('take_home')) {
      assessment++;
      ps.callbacks++;
    } else if (status.includes('interview') || status.includes('screen') || status.includes('responded')) {
      interviewing++;
      ps.callbacks++;
    } else if (status.includes('reject') || status.includes('ghost') || status.includes('withdraw')) {
      rejected++;
    } else if (datePrefix) {
      const ageDays = (Date.now() - Date.parse(datePrefix)) / 86400000;
      if (!Number.isNaN(ageDays) && ageDays >= 14) rejected++;
    }
  }

  const warmupActive = runDates.size < 3;
  const effectiveCap = warmupActive ? Math.min(5, maxPerDay) : maxPerDay;

  let topPlatform = 'n/a (no submitted applications yet)';
  if (platStats.size > 0) {
    const sorted = [...platStats.entries()].sort((a, b) => (b[1].callbacks - a[1].callbacks) || (b[1].submitted - a[1].submitted));
    const [name, st] = sorted[0];
    const pct = ((st.callbacks / st.submitted) * 100).toFixed(0);
    topPlatform = `${name} (${st.callbacks}/${st.submitted} callbacks · ${pct}%)`;
  }

  console.log(paint('36', `\nJob Hunter OS Status — ${ROOT}\n`));
  ok(`Readiness Gates:        ${gateScore}/5 ${gateScore === 5 ? '(READY)' : '(run /setup to complete)'}`);
  info(`Today vs. Daily Cap:    ${todayApplied}/${effectiveCap} applications (${warmupActive ? 'Warm-up Days 1-3 cap: 5/day' : `Standard cap: ${maxPerDay}/day`}, dry_run: ${dryRun ? 'ON' : 'OFF'})`);
  info(`Pipeline Summary:       Applied: ${totalApplied} | Interviewing: ${interviewing} | Assessment: ${assessment} | Offers: ${offers} | Rejected/Ghosted: ${rejected}`);
  info(`Top Performing Channel: ${topPlatform}`);
}

function readContextOrExample(root, srcRoot, relPath) {
  const candidates = [
    path.join(root, relPath),
    path.join(root, `${relPath}.example`),
    path.join(srcRoot, relPath),
    path.join(srcRoot, `${relPath}.example`),
  ];
  const found = candidates.find(f => fs.existsSync(f));
  return found ? fs.readFileSync(found, 'utf8') : `<!-- ${relPath} not found -->\n`;
}

function cmdBundle() {
  const outFile = path.join(ROOT, 'logs', 'exports', 'web-chat-master-prompt.md');
  const sections = [
    '# Job Hunter OS — Portable Web-Chat Master Prompt Bundle',
    '',
    '> Paste or upload this single file into ChatGPT Web, Claude Web, or Gemini Web when running without Playwright MCP (`skills/fallback-no-mcp.md`).',
    '> Then paste any job description to get an honest 0-10 match score, ATS Keyword Heatmap (`skills/21-ats-keyword-heatmap.md`), and a tailored single-column HTML resume.',
    '',
    '---',
    '## 1. Canonical Agent Rules (`AGENTS.md`)',
    '',
    readContextOrExample(ROOT, SOURCE, 'AGENTS.md'),
    '',
    '---',
    '## 2. Web-Chat No-MCP Fallback Playbook (`skills/fallback-no-mcp.md`)',
    '',
    readContextOrExample(ROOT, SOURCE, 'skills/fallback-no-mcp.md'),
    '',
    '---',
    '## 3. Skill Registry (`skills/REGISTRY.md`)',
    '',
    readContextOrExample(ROOT, SOURCE, 'skills/REGISTRY.md'),
    '',
    '---',
    '## 4. Candidate Profile (`context/profile.md`)',
    '',
    readContextOrExample(ROOT, SOURCE, 'context/profile.md'),
    '',
    '---',
    '## 5. Candidate CV (`context/cv.md`)',
    '',
    readContextOrExample(ROOT, SOURCE, 'context/cv.md'),
    '',
    '---',
    '## 6. Target Preferences (`context/preferences.yaml`)',
    '',
    '```yaml',
    readContextOrExample(ROOT, SOURCE, 'context/preferences.yaml').trim(),
    '```',
    '',
    '---',
    '## 7. Verified Form Answers & Comp Floor (`context/form-answers.yaml`)',
    '',
    '```yaml',
    readContextOrExample(ROOT, SOURCE, 'context/form-answers.yaml').trim(),
    '```',
    '',
  ];
  writeAtomic(outFile, sections.join('\n'), { mode: 0o600 });
  ok(`Bundled portable web-chat prompt -> ${outFile}`);
  info('Upload or paste this file into ChatGPT Web, Claude Web, or Gemini Web along with any target job description.');
}

function openFileInBrowser(targetFile) {
  if (opts.noOpen || process.env.CI) return;
  try {
    if (process.platform === 'win32') {
      const child = spawn('cmd', ['/c', 'start', '', targetFile], { detached: true, stdio: 'ignore' });
      child.unref();
    } else if (process.platform === 'darwin') {
      const child = spawn('open', [targetFile], { detached: true, stdio: 'ignore' });
      child.unref();
    } else {
      const child = spawn('xdg-open', [targetFile], { detached: true, stdio: 'ignore' });
      child.unref();
    }
  } catch { /* ignore headless browser launch errors */ }
}

function cmdDashboard() {
  const tplPath = [
    path.join(ROOT, 'templates', 'analytics-dashboard.html'),
    path.join(SOURCE, 'templates', 'analytics-dashboard.html'),
  ].find(f => fs.existsSync(f));
  if (!tplPath) throw new Error('templates/analytics-dashboard.html not found.');

  const records = readApplicationsLog(ROOT);
  const tpl = fs.readFileSync(tplPath, 'utf8');
  const injected = tpl.replace('/*__APPLICATIONS_DATA__*/[]', JSON.stringify(records));
  const outFile = path.join(ROOT, 'logs', 'exports', 'dashboard.html');
  writeAtomic(outFile, injected);
  ok(`Generated local Kanban & Analytics Dashboard (${records.length} record(s)) -> ${outFile}`);
  openFileInBrowser(outFile);
}

function cmdUnlock() {
  const profile = path.join(ROOT, 'browser-profile');
  refuseSymlink(profile);
  if (!fs.existsSync(profile)) {
    fs.mkdirSync(profile, { recursive: true });
    ok(`Initialized clean browser-profile directory at ${profile} (0 lock files).`);
    return;
  }
  const lockNames = ['SingletonLock', 'SingletonCookie', 'SingletonSocket', 'lockfile', 'DevToolsActivePort'];
  let removed = 0;
  for (const name of lockNames) {
    const target = path.join(profile, name);
    try {
      fs.lstatSync(target);
      fs.rmSync(target, { force: true });
      removed++;
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
  ok(`Unlocked browser-profile at ${profile} (${removed} stale Chromium lock file(s) removed).`);
}

function cmdBackup() {
  const jsonFiles = ['logs/applications-log.json', 'logs/skipped-jobs.json', 'logs/circuit-breaker.json'];
  let verifiedCount = 0;
  for (const rel of jsonFiles) {
    const f = path.join(ROOT, rel);
    if (!fs.existsSync(f)) continue;
    refuseSymlink(f);
    try {
      JSON.parse(fs.readFileSync(f, 'utf8'));
      verifiedCount++;
    } catch (e) {
      throw new Error(`JSON integrity check failed for ${f}: ${e.message}`);
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const destDir = path.join(ROOT, 'logs', 'backups', `backup-${stamp}`);
  refuseSymlink(destDir);
  fs.mkdirSync(destDir, { recursive: true });

  let copied = 0;
  const ctxDir = path.join(ROOT, 'context');
  if (fs.existsSync(ctxDir)) {
    copied += copyTree(ctxDir, path.join(destDir, 'context'), { preserve: false });
  }
  for (const rel of jsonFiles) {
    const src = path.join(ROOT, rel);
    if (fs.existsSync(src)) {
      const dst = path.join(destDir, rel);
      if (writeAtomic(dst, fs.readFileSync(src), { mode: 0o600 })) copied++;
    }
  }
  ok(`Verified JSON integrity (${verifiedCount} log file(s)) & backed up ${copied} file(s) -> ${destDir}`);
}

function cmdHelp() {
  console.log(`job-hunter-os v1.1.0 — Zero-Code Markdown Agent Skills & MCP Installer

Usage:
  job-hunter init [--global | -g] [--ide <name>]   Scaffold agent home & sync IDE skills/MCP
  job-hunter update [--global | -g] [--ide <name>] Refresh skills/adapters/templates (preserves context/ & logs/)
  job-hunter doctor [--global | -g] [--strict]     Run cross-platform installation, readiness & live URL diagnostics
  job-hunter status [--global | -g]                Print readiness gates, daily warm-up cap & pipeline funnel summary
  job-hunter bundle [--global | -g]                Export single-file web-chat prompt to logs/exports/web-chat-master-prompt.md
  job-hunter dashboard [--global | -g] [--no-open] Generate & open local Kanban dashboard at logs/exports/dashboard.html
  job-hunter unlock [--global | -g]                Remove stale Chromium lock files from browser-profile/ after crash
  job-hunter backup [--global | -g]                Verify JSON log integrity & snapshot context/ + logs/ to logs/backups/
  job-hunter login [--global | -g]                 Open Chrome/Chromium with persistent browser-profile/
  job-hunter sync-mcp [--global | -g]              Safely merge Playwright & optional Notion MCP configs
  job-hunter --help                                Show this help message`);
}

// ---------------- dispatch ----------------
try {
  if (Number(process.versions.node.split('.')[0]) < 18) throw new Error('Node.js 18+ is required.');
  if (argErr) throw new Error(argErr);
  if (command === 'help' || opts.help) cmdHelp();
  else if (command === 'init') cmdInit();
  else if (command === 'update') cmdUpdate();
  else if (command === 'doctor') await cmdDoctor();
  else if (command === 'status') cmdStatus();
  else if (command === 'bundle') cmdBundle();
  else if (command === 'dashboard') cmdDashboard();
  else if (command === 'unlock') cmdUnlock();
  else if (command === 'backup') cmdBackup();
  else if (command === 'login') cmdLogin();
  else if (command === 'sync-mcp') syncMcp();
  else throw new Error(`Unknown command "${command}". Run with --help for usage.`);
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
}
