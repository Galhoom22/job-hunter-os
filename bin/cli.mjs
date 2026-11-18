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
const BOOLEAN_FLAGS = new Set(['--global', '-g', '--help', '-h', '--strict', '--yes', '-y']);
const positional = [];
const opts = { global: false, ide: 'all', help: false, strict: false };
let argErr = null;

for (let i = 0; i < ARGV.length; i++) {
  const a = ARGV[i];
  if (a === '--global' || a === '-g') opts.global = true;
  else if (a === '--help' || a === '-h') opts.help = true;
  else if (a === '--strict') opts.strict = true;
  else if (a === '--yes' || a === '-y') opts.yes = true;
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
  for (const d of ['logs/runs', 'logs/resumes', 'logs/screenshots', 'logs/insights', 'assets', 'browser-profile']) {
    const p = path.join(targetRoot, d);
    refuseSymlink(p);
    fs.mkdirSync(p, { recursive: true });
  }
  writeAtomic(path.join(targetRoot, 'logs', 'applications-log.json'), '[]\n', { preserve: true, mode: 0o600 });
  writeAtomic(path.join(targetRoot, 'logs', 'skipped-jobs.json'), '[]\n', { preserve: true, mode: 0o600 });
  ensurePrivateGitignore(targetRoot);
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

function cmdDoctor() {
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

  const prof = isPopulated(ROOT, 'context/profile.md');
  const cv = isPopulated(ROOT, 'context/cv.md');
  const hasPdf = ['assets/resume.pdf', 'context/resume.pdf'].some(rel => {
    const f = path.join(ROOT, rel);
    try { return fs.existsSync(f) && fs.readFileSync(f).subarray(0, 5).toString() === '%PDF-'; } catch { return false; }
  });
  checkGate('Gate 1 · CV & Profile', prof.ready && cv.ready && hasPdf, 'run /setup in your IDE to confirm CV & add resume.pdf');

  const prefs = isPopulated(ROOT, 'context/preferences.yaml');
  checkGate('Gate 2 · Target Preferences', prefs.ready, 'confirm target roles, regions & work modes in /setup');

  const ansFile = path.join(ROOT, 'context', 'form-answers.yaml');
  const ans = isPopulated(ROOT, 'context/form-answers.yaml');
  const ownerVerified = fs.existsSync(ansFile) && /^owner_verified:\s*true\s*(?:#.*)?$/m.test(fs.readFileSync(ansFile, 'utf8'));
  checkGate('Gate 3/4 · Legal, Comp & Skills', ans.ready && ownerVerified, 'confirm salary, visa, and skill years in /setup');

  const targetsFile = path.join(ROOT, 'context', 'targets.yaml');
  const hasEnabledTarget = fs.existsSync(targetsFile) && /^\s+enabled:\s*true\s*(?:#.*)?$/m.test(fs.readFileSync(targetsFile, 'utf8'));
  checkGate('Gate 5 · Enabled Targets', hasEnabledTarget, 'enable at least one board in context/targets.yaml via /setup');

  const profileExists = fs.existsSync(path.join(ROOT, 'browser-profile'));
  checkGate('Browser Profile Directory', profileExists, 'run `login` to initialize browser-profile/');

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

function cmdHelp() {
  console.log(`job-hunter-os v1.0.0 — Zero-Code Markdown Agent Skills & MCP Installer

Usage:
  job-hunter init [--global | -g] [--ide <name>]   Scaffold agent home & sync IDE skills/MCP
  job-hunter update [--global | -g] [--ide <name>] Refresh skills/adapters/templates (preserves context/ & logs/)
  job-hunter doctor [--global | -g] [--strict]     Run cross-platform installation & readiness diagnostics
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
  else if (command === 'doctor') cmdDoctor();
  else if (command === 'login') cmdLogin();
  else if (command === 'sync-mcp') syncMcp();
  else throw new Error(`Unknown command "${command}". Run with --help for usage.`);
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
}
