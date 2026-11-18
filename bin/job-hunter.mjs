#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';
import { auditReadiness } from './readiness.mjs';
import { extractPdfText, docxToText, assessText, contactCandidates, htmlToBlocks, blocksToText, blocksToDocx, htmlToWordDoc, htmlProblems, documentKind, fillResumeTemplate, fillCoverLetterTemplate, coverLetterProblems, slug } from './cv-tools.mjs';
import { checkResumeData } from './resume-data.mjs';
import { validateSkills, syncSkills, installSkills, setEnabled, exportSkills, readManifest, formatList } from './skills.mjs';
import { verifyTailoredCv } from './verify-cv.mjs';
import { pullAts, formatHarvestTable, ATS_PROVIDERS } from './ats-harvester.mjs';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const home = os.homedir();
const argv = process.argv.slice(2);
const global = argv.includes('--global') || argv.includes('-g');
const flags = new Set(['--global', '-g', '--help', '-h', '--no-pdf', '--force', '--all', '--strict-humanize']);
const valueOpts = new Map([['--out-dir', 'outDir'], ['--ide', 'ide'], ['--out', 'out'], ['--limit', 'limit'], ['--profile', 'profile'], ['--resume-data', 'resumeData']]);
const multiOpts = new Map([['--board', 'boards'], ['--role', 'roles'], ['--location', 'locations']]);
const positional = []; const options = { boards: [], roles: [], locations: [] }; let argError = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  const eq = a.indexOf('=');
  const key = eq > 0 ? a.slice(0, eq) : a;
  if (valueOpts.has(key)) {
    const val = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (!val || val.startsWith('-')) argError = `${key} needs a value.`;
    else options[valueOpts.get(key)] = val;
  } else if (multiOpts.has(key)) {
    const val = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (!val || val.startsWith('-')) argError = `${key} needs a value.`;
    else options[multiOpts.get(key)].push(val);
  } else if (flags.has(a)) options[a] = true;
  else if (a.startsWith('-')) argError = 'Unknown option. Use --help.';
  else positional.push(a);
}
const command = positional[0] || 'help';
const explicitLocal = fs.existsSync(path.join(process.cwd(), '.job-hunter-install.json'));
const root = global ? path.join(home, '.job-hunter-os') : explicitLocal || command === 'init' ? process.cwd() : fs.existsSync(path.join(home, '.job-hunter-os', '.job-hunter-install.json')) ? path.join(home, '.job-hunter-os') : process.cwd();
const color = process.stdout.isTTY && !process.env.NO_COLOR;
const say = (message, tone = '32') => console.log(color ? `\x1b[${tone}m${message}\x1b[0m` : message);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
function safePath(file) {
  let cursor = path.resolve(file);
  while (true) {
    let stat;
    try { stat = fs.lstatSync(cursor); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (stat?.isSymbolicLink()) throw new Error('Refusing a symbolic-link destination; choose a regular directory.');
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
}
function write(file, text, { preserve = false, mode = 0o600 } = {}) {
  safePath(file);
  if (preserve && fs.existsSync(file)) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const temp = `${file}.job-hunter-${process.pid}.tmp`;
  fs.writeFileSync(temp, text, { flag: 'wx', mode });
  try { fs.renameSync(temp, file); fs.chmodSync(file, mode); } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
  return true;
}
function copyTree(from, to, filter = () => true) {
  if (!fs.existsSync(from)) return;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (!filter(entry.name) || entry.isSymbolicLink()) continue;
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyTree(path.join(from, entry.name), dest, filter);
    else if (entry.isFile()) write(dest, fs.readFileSync(path.join(from, entry.name)), { preserve: true });
  }
}
function backup(file) {
  if (!fs.existsSync(file)) return;
  safePath(file);
  const dest = `${file}.job-hunter-backup-${Date.now()}-${process.pid}`;
  fs.copyFileSync(file, dest, fs.constants.COPYFILE_EXCL);
  fs.chmodSync(dest, 0o600);
}
function configRead(file) {
  safePath(file);
  if (!fs.existsSync(file)) return {};
  let value;
  try { value = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { throw new Error('Invalid IDE configuration syntax; MCP files were not changed. Review privately or use a manual import.'); }
  if (!object(value) || (value.mcpServers !== undefined && !object(value.mcpServers))) throw new Error('Unsupported MCP configuration shape; refusing to replace it.');
  return value;
}
function configTargets(isGlobal) {
  const cursor = isGlobal ? home : root;
  return [
    path.join(isGlobal ? home : root, isGlobal ? '.claude.json' : '.mcp.json'),
    path.join(cursor, '.cursor', 'mcp.json'),
    path.join(home, '.gemini', 'antigravity', 'mcp_config.json'),
    path.join(home, '.codeium', 'windsurf', 'mcp_config.json'),
    // Cline settings storage varies per host editor: explicit private import file, not a guessed VS Code profile.
    path.join(root, 'mcp', 'cline.import.json'),
    path.join(root, '.mcp.json'),
  ].filter((file, i, all) => all.indexOf(file) === i);
}
function syncMcp(isGlobal = global || root === path.join(home, '.job-hunter-os')) {
  const templatePath = path.join(root, 'mcp', 'mcp.template.json');
  if (!fs.existsSync(templatePath)) throw new Error('Run init in this directory or init --global first.');
  const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  const browser = template.mcpServers.playwright;
  if (!object(browser) || !Array.isArray(browser.args)) throw new Error('Invalid canonical Playwright template.');
  browser.args = browser.args.map(a => a.startsWith('--user-data-dir=') ? `--user-data-dir=${path.join(root, 'browser-profile')}` : a);
  if (!browser.args.some(a => a.startsWith('--user-data-dir='))) throw new Error('Canonical template requires a persistent profile.');
  // Tokens stay in env/private existing configs, never copied to a new config automatically.
  const servers = { playwright: browser };
  const files = configTargets(isGlobal);
  const changes = files.map(file => {
    const current = configRead(file);
    const previous = current.mcpServers || {};
    const next = { ...previous };
    for (const [key, value] of Object.entries(servers)) {
      if (next[key] && JSON.stringify(next[key]) !== JSON.stringify(value)) throw new Error('An existing playwright server differs. It was preserved; rename it or explicitly reconcile its profile before syncing.');
      next[key] = value;
    }
    return [file, JSON.stringify({ ...current, mcpServers: next }, null, 2) + '\n'];
  });
  for (const [file, text] of changes) {
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === text) continue;
    backup(file); write(file, text);
  }
  write(path.join(root, 'mcp', 'notion.import.json'), JSON.stringify({ mcpServers: { notion: template.mcpServers.notion } }, null, 2) + '\n', { preserve: true });
  say('Playwright MCP synced; existing servers/settings preserved.');
  say('Notion is opt-in: import mcp/notion.import.json with secure env configuration after approved setup. Cline: import mcp/cline.import.json in its MCP settings. Restart IDE MCP tools.', '33');
}
function commandText(name) {
  const file = path.join(source, 'commands', `${name}.md`);
  const base = fs.readFileSync(file, 'utf8');
  return base.replaceAll('{{AGENT_HOME}}', root);
}
function inject(isGlobal) {
  const names = ['setup', 'daily-run', 'tailor-cv', 'apply-url', 'weekly-report', 'linkedin-growth'];
  const dirs = isGlobal ? [path.join(home, '.claude', 'commands'), path.join(home, '.antigravity', 'workflows'), path.join(home, '.windsurf', 'workflows')] : [path.join(root, '.claude', 'commands'), path.join(root, '.agent', 'workflows'), path.join(root, '.windsurf', 'workflows')];
  for (const dir of dirs) for (const name of names) write(path.join(dir, `${name}.md`), commandText(name), { preserve: true });
  const text = `Read ${path.join(root, 'AGENTS.md')} before job-hunting requests. Agent home is ${root}; resolve all context, tools and logs there, not the active project. Read ${path.join(root, 'docs', 'chat-commands.md')} for six commands. Respect dry run, verified facts, caps, locks and approval. Do not modify unrelated project files.\n`;
  for (const file of isGlobal ? [path.join(home, '.cursor', 'rules', 'job-hunter.mdc'), path.join(home, '.windsurf', 'rules', 'job-hunter.md'), path.join(home, '.clinerules', 'job-hunter.md')] : [path.join(root, '.cursor', 'rules', 'job-hunter.mdc')]) {
    write(file, file.endsWith('.mdc') ? `---\ndescription: Job Hunter OS chat commands\nalwaysApply: false\n---\n\n${text}` : text, { preserve: true });
  }
  if (isGlobal) say('Global command files written without overwriting existing files. IDE/version support varies; import workflows if not discovered.', '33');
}
function init() {
  safePath(root); fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  for (const dir of ['extension', 'skills', 'prompts', 'templates', 'config', 'docs', 'schemas', 'scripts', 'bin', 'commands', 'mcp']) copyTree(path.join(source, dir), path.join(root, dir), name => !name.includes('import.json') && name !== 'tests');
  for (const name of ['AGENTS.md', 'CLAUDE.md', '.windsurfrules', '.clinerules', 'LICENSE']) write(path.join(root, name), fs.readFileSync(path.join(source, name)), { preserve: true });
  for (const name of fs.readdirSync(path.join(source, 'context')).filter(name => name.endsWith('.example'))) {
    write(path.join(root, 'context', name), fs.readFileSync(path.join(source, 'context', name)), { preserve: true });
    write(path.join(root, 'context', name.replace(/\.example$/, '')), fs.readFileSync(path.join(source, 'context', name)), { preserve: true });
  }
  write(path.join(root, 'context', 'DROP_YOUR_FILES_HERE.md'), fs.readFileSync(path.join(source, 'context', 'DROP_YOUR_FILES_HERE.md')), { preserve: true });
  for (const dir of ['logs/runs', 'logs/resumes', 'logs/screenshots', 'browser-profile', 'assets']) { safePath(path.join(root, dir)); fs.mkdirSync(path.join(root, dir), { recursive: true, mode: 0o700 }); }
  write(path.join(root, 'logs', 'applications-log.json'), '[]\n', { preserve: true });
  const manifest = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8'));
  const helperScripts = Object.fromEntries(Object.entries(manifest.scripts).filter(([key]) => ['preflight','validate:logs','run:lock','journal','insights','resume:render','export'].includes(key)));
  write(path.join(root, 'package.json'), JSON.stringify({ name: 'job-hunter-local-runtime', private: true, type: 'module', scripts: helperScripts, dependencies: { tsx: '^4.23.15', yaml: '^2.9.1', zod: '^3.25.76', playwright: '^1.59.0' } }, null, 2) + '\n', { preserve: true });
  write(path.join(root, '.job-hunter-runtime.json'), JSON.stringify({ root, helperScripts }, null, 2) + '\n', { preserve: true });
  const ignoreFile = path.join(root, '.gitignore'); safePath(ignoreFile);
  const old = fs.existsSync(ignoreFile) ? fs.readFileSync(ignoreFile, 'utf8') : '';
  const marker = '# Job Hunter OS private runtime';
  if (!old.includes(marker)) write(ignoreFile, old + `\n${marker}\n/context/*\n!/context/*.example\n!/context/DROP_YOUR_FILES_HERE.md\n/logs/\n/browser-profile/\n/assets/*.pdf\n/.env*\n!/.env.example\n/.mcp.json\n/.cursor/mcp.json\n/mcp/*.import.json\n*.job-hunter-backup-*\nnode_modules/\n`);
  write(path.join(root, '.job-hunter-install.json'), JSON.stringify({ version: 1, scope: global ? 'global' : 'local' }, null, 2) + '\n', { preserve: true });
  inject(global); syncMcp(global);
  say(`Installed agent home: ${root}`);
  say('Next: doctor; login; open your IDE and request /setup with your CV. Examples are NOT verified facts. Daily-run helper dependencies require an explicit local npm install during setup.', '33');
}
function doctor() {
  let failures = 0;
  const check = (ok, label, detail) => { if (!ok) failures++; say(`[${ok ? '✓' : '✗'}] ${label.padEnd(27)} ${detail}`, ok ? '32' : '33'); };
  say(`Job Hunter OS doctor — ${root}`);
  const readiness = auditReadiness(root);
  for (const [key, gate] of Object.entries(readiness.gates)) check(gate.complete, key, gate.complete ? 'Verified prerequisite evidence' : gate.missing.join('; '));
  check(readiness.overall_ready, 'Strict readiness state', readiness.overall_ready ? 'READY_100% — per-run confirmation still required' : 'HARD BLOCK: request /setup for the 3–4-question interview');
  check(Number(process.versions.node.split('.')[0]) >= 18, 'Node.js 18+', process.versions.node);
  const probe = spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', ['npx'], { stdio: 'pipe' });
  check(probe.status === 0, 'npx available', probe.status === 0 ? 'found' : 'install Node/npm');
  const populated = name => {
    const file = path.join(root, 'context', name);
    if (!fs.existsSync(file)) return false;
    const text = fs.readFileSync(file, 'utf8');
    const example = path.join(root, 'context', name + '.example');
    return text.trim().length > 20 && !(fs.existsSync(example) && text === fs.readFileSync(example, 'utf8')) && !/example\.com|your-handle|your-site|replace-with|Acme Fintech|Nile Commerce/.test(text);
  };
  check(populated('profile.md'), 'Profile populated', 'placeholder heuristic only; owner review still required');
  const answers = path.join(root, 'context', 'form-answers.yaml');
  check(populated('form-answers.yaml') && /^owner_verified:\s*true\s*(?:#.*)?$/m.test(fs.existsSync(answers) ? fs.readFileSync(answers, 'utf8') : ''), 'Form answers verified', 'must have owner_verified: true');
  check(Boolean(readiness.pdf), 'Base resume PDF', 'assets/resume.pdf or context/resume.pdf signature; content needs human review');
  for (const file of configTargets(global || root === path.join(home, '.job-hunter-os'))) {
    let good = false;
    try { good = configRead(file).mcpServers?.playwright?.args?.includes(`--user-data-dir=${path.join(root, 'browser-profile')}`) === true; } catch { /* diagnostics without private values */ }
    check(good, 'MCP config', file);
  }
  check(fs.existsSync(path.join(root, 'browser-profile', 'Default')), 'Browser profile initialized', 'directory evidence only, not proof of logged-in sessions');
  say(`[i] Optional NOTION_TOKEN       ${process.env.NOTION_TOKEN ? 'present (value hidden; access unverified)' : 'not set — local-only mode available'}`, '36');
  say('Doctor is not preflight, live auth verification, tool installation, or submission authorization.', '36');
  process.exitCode = failures ? 1 : 0;
}
function login() {
  if (!fs.existsSync(path.join(root, '.job-hunter-install.json'))) throw new Error('Run init first.');
  const profile = path.join(root, 'browser-profile'); safePath(profile);
  if (fs.existsSync(path.join(root, 'logs', 'run.lock')) || ['SingletonLock', 'SingletonCookie'].some(name => fs.existsSync(path.join(profile, name)))) throw new Error('Browser/run lock exists. Close the other browser/agent; do not delete its locks.');
  const candidates = process.platform === 'win32' ? [path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google/Chrome/Application/chrome.exe'), path.join(process.env.LOCALAPPDATA || home, 'Google/Chrome/Application/chrome.exe')] : process.platform === 'darwin' ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'] : ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/opt/google/chrome/chrome'];
  const executable = candidates.find(file => fs.existsSync(file));
  if (!executable) throw new Error('No installed Chrome/Chromium found. Install one, or ask Playwright MCP to open a headed browser during /setup. The CLI does not download a browser silently.');
  const args = [`--user-data-dir=${profile}`, '--no-first-run', '--new-window', 'https://www.linkedin.com/login', 'https://wellfound.com/login', 'https://wuzzuf.net/login', 'https://www.indeed.com/'];
  const child = spawn(executable, args, { detached: true, stdio: 'ignore' });
  child.on('error', () => { say('Browser launch failed; use the headed Playwright MCP setup workflow.', '31'); process.exitCode = 1; });
  child.unref(); say('Browser opened for manual login. Enter credentials only there, then close it before starting MCP. Sessions must be reverified in /setup.');
}
function addPlatform(name) {
  if (!name || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) throw new Error('Platform must be a lowercase slug of at most 64 characters; no paths.');
  const file = path.join(root, 'skills', 'platforms', `${name}.md`);
  const targetsFile = path.join(root, 'context', 'targets.yaml');
  safePath(file); safePath(targetsFile);
  if (!fs.existsSync(targetsFile)) throw new Error('Run init before adding a platform.');
  const targets = fs.readFileSync(targetsFile, 'utf8');
  if (!/^targets:\s*(?:#.*)?$/m.test(targets) || /\t/.test(targets) || /^\s*targets:\s*\[/m.test(targets) || targets.split(/\r?\n/).some(line => /^[^\s#]/.test(line) && !/^targets:\s*(?:#.*)?$/.test(line))) throw new Error('Unsupported target YAML layout; ask the agent to register this board after review.');
  const marker = `# job-hunter-platform: ${name}`;
  if (fs.existsSync(file) || targets.includes(marker)) throw new Error('Platform already exists; existing playbook and targets preserved.');
  const template = fs.readFileSync(path.join(root, 'skills', 'platforms', '_template.md'), 'utf8').replaceAll('PLATFORM', name).replace('name: platform-key', `name: ${name}`);
  // Never enable an unknown board or invent a real URL. The owner must provide it during chat setup.
  const block = `\n  ${marker}\n  - name: ${JSON.stringify(name + ' — configure URL before enabling')}\n    platform: other\n    enabled: false\n    url: https://example.invalid/\n    auth_check_url: https://example.invalid/\n    auth_required: true\n    max_results: 10\n`;
  backup(targetsFile); write(file, template, { preserve: true }); write(targetsFile, targets.trimEnd() + '\n' + block);
  say(`Added disabled manual-review platform ${name}. Supply its real URL in chat; other has cap 0 until a reviewed adapter exists.`);
}
function bundlePrompt() {
  const sources = ['AGENTS.md', 'context/profile.md', 'context/form-answers.yaml'];
  const sections = sources.map(name => {
    const file = path.join(root, name); safePath(file);
    if (!fs.existsSync(file)) throw new Error('Complete /setup before bundling; required context is missing.');
    const text = fs.readFileSync(file, 'utf8');
    if (name !== 'AGENTS.md') {
      const example = file + '.example';
      if ((fs.existsSync(example) && text === fs.readFileSync(example, 'utf8')) || /replace-with|your-handle|example\.com|Acme Fintech|Nile Commerce/.test(text)) throw new Error('Bundle refused: example context is not verified owner data.');
      if (name.endsWith('.yaml') && !/^owner_verified:\s*true\s*(?:#.*)?$/m.test(text)) throw new Error('Bundle requires owner-verified form answers.');
      if (/\b(?:NOTION_TOKEN|api[_-]?key|access[_-]?token|password|cookie)\s*[:=]/i.test(text)) throw new Error('Possible credentials detected; review privately before bundling.');
    }
    return `## Source: ${name}\n\n${text}`;
  });
  const output = path.join(root, 'logs', 'master-chat-prompt.md');
  safePath(output);
  if (fs.existsSync(output)) throw new Error('Existing master prompt preserved; remove it privately after review before rebundling.');
  write(output, '# Private owner-approved chat context\n\nContains personal information. Review/redact before uploading to any external AI. No credentials or browser sessions are included. Read skills/fallback-no-mcp.md; web chat cannot run local tools or authorize submissions by itself.\n\n' + sections.join('\n\n'));
  // Markdown artifacts do not alter JSON records; validate existing logs after any logs write.
  const runtime = path.join(root, '.job-hunter-runtime.json');
  const manifest = configRead(path.join(root, 'package.json'));
  const expected = fs.existsSync(runtime) ? configRead(runtime).helperScripts?.['validate:logs'] : undefined;
  if (expected && manifest.scripts?.['validate:logs'] === expected && fs.existsSync(path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx'))) {
    const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'validate:logs'], { cwd: root, stdio: 'pipe' });
    if (result.status !== 0) { fs.unlinkSync(output); throw new Error('Log validation failed; no master prompt was kept.'); }
  } else { fs.unlinkSync(output); throw new Error('Approved local validation helpers are required; complete /setup before bundling.'); }
  say('Private logs/master-chat-prompt.md created. Review/redact it before explicitly uploading to an external AI; no upload was performed.');
}
function regularFile(file, maxBytes) {
  let stat;
  try { stat = fs.lstatSync(file); } catch { throw new Error('File not found.'); }
  if (!stat.isFile()) throw new Error('Expected a regular file (symbolic links and folders are refused).');
  if (stat.size > maxBytes) throw new Error(`File is larger than ${Math.round(maxBytes / 1048576)} MB.`);
  return fs.readFileSync(file);
}
const CV_CANDIDATES = ['assets/resume.pdf', 'assets/resume.docx', 'context/resume.pdf', 'context/resume.docx', 'assets/resume.md', 'assets/resume.txt', 'context/resume.md', 'context/resume.txt'];
function parseCv(input) {
  if (!fs.existsSync(path.join(root, 'context'))) throw new Error('No context/ folder here. Run init first or run from the agent home.');
  const file = input ? path.resolve(process.cwd(), input) : CV_CANDIDATES.map(name => path.join(root, name)).find(name => fs.existsSync(name));
  if (!file) throw new Error('No CV found. Drop resume.pdf, resume.docx, resume.md or resume.txt into assets/, or paste the CV text in chat.');
  const buf = regularFile(file, 15 * 1048576);
  const ext = path.extname(file).toLowerCase();
  let text = '', format = ext.slice(1) || 'unknown', details = {}, failure = null;
  try {
    if (ext === '.pdf' || buf.subarray(0, 5).toString('latin1') === '%PDF-') { format = 'pdf'; const r = extractPdfText(buf); text = r.text; details = { pages: r.pages, images: r.images, encrypted: r.encrypted }; }
    else if (ext === '.docx') text = docxToText(buf);
    else if (['.md', '.markdown', '.txt', '.text'].includes(ext)) text = buf.toString('utf8');
    else if (ext === '.json') text = JSON.stringify(JSON.parse(buf.toString('utf8')), null, 2);
    else failure = ext === '.doc' ? 'unsupported_legacy_doc' : 'unsupported_format';
  } catch { failure = 'extraction_failed'; }
  const assessment = failure ? { quality: failure, words: 0 } : assessText(text);
  if (details.encrypted && assessment.quality !== 'readable') assessment.quality = 'encrypted';
  const readable = assessment.quality === 'readable';
  const tier = readable ? (['pdf', 'docx'].includes(format) ? 'tier2_local_extraction' : 'tier1_text')
    : details.images && assessment.words < 50 ? 'tier3_scanned_image' : ['garbled', 'unreadable'].includes(assessment.quality) && format === 'pdf' ? 'tier3_unreadable_pdf' : 'tier2_ask_for_text';
  const outText = path.join(root, 'context', 'cv-extracted.txt');
  const outReport = path.join(root, 'context', 'cv-extracted.report.json');
  if (text.trim()) write(outText, text.trim() + '\n');
  write(outReport, JSON.stringify({ owner_verified: false, source_file: file, format, tier, ...assessment, ...details, extracted_at: new Date().toISOString(), text_file: text.trim() ? outText : null, contact_candidates: readable ? contactCandidates(text) : null }, null, 2) + '\n');
  say(`CV ${readable ? 'read' : 'NOT readable'}: ${format}, ${assessment.words} words, quality=${assessment.quality}, ${tier}`, readable ? '32' : '33');
  say(`Report: ${outReport}`, '36');
  if (readable) {
    say(`Text: ${outText}`, '36');
    say('Next: the agent builds context/profile.md, context/cv.md and context/resume-data.json from this text, then confirms every fact with you. Nothing is verified yet.');
  } else {
    if (tier.startsWith('tier3')) say('This file has little or no selectable text (scanned image or design-tool export). Applicant tracking systems may see it as blank too.', '33');
    say('Next: paste your CV text in chat (or provide .txt/.md/.docx). After you confirm the facts, the agent can rebuild a clean ATS-readable PDF with render-cv.', '33');
    process.exitCode = 3;
  }
}
function readTemplate(name) {
  for (const base of [root, source]) { const file = path.join(base, 'templates', name); if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8'); }
  throw new Error(`Template ${name} is missing.`);
}
async function loadChromium() {
  const { createRequire } = await import('node:module');
  for (const base of [root, source]) {
    try {
      const resolved = createRequire(path.join(base, 'package.json')).resolve('playwright');
      const mod = await import(pathToFileURL(resolved).href);
      const chromium = mod.chromium ?? mod.default?.chromium;
      if (chromium) return chromium;
    } catch { /* not installed here */ }
  }
  return null;
}
async function renderPdf(chromium, html) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.route('**/*', route => route.abort());
    await page.setContent(html, { waitUntil: 'load' });
    return await page.pdf({ format: 'A4', printBackground: false, preferCSSPageSize: true });
  } finally { await browser.close(); }
}
async function renderCv(input, { outDir, pdf }) {
  if (!input) throw new Error('Usage: render-cv FILE.html|FILE.json [--out-dir DIR] [--no-pdf]');
  const file = path.resolve(process.cwd(), input);
  const raw = regularFile(file, 5 * 1048576).toString('utf8');
  const ext = path.extname(file).toLowerCase();
  let html, kind, notes = null, defaultDir;
  if (ext === '.json') {
    let data; try { data = JSON.parse(raw); } catch { throw new Error('Payload is not valid JSON.'); }
    if (data?.document === 'cover_letter') {
      const problems = coverLetterProblems(data);
      if (problems.length) throw new Error(`Cover letter refused: ${problems.join('; ')}`);
      html = fillCoverLetterTemplate(readTemplate('ats-cover-letter-template.html'), data); kind = 'cover_letter';
    } else {
      const problems = checkResumeData(data, { requireVerified: true });
      if (problems.length) throw new Error(`Resume refused: ${problems.slice(0, 6).join('; ')}`);
      html = fillResumeTemplate(readTemplate('ats-resume-template.html'), data); kind = 'resume'; notes = data.tailoring_notes ?? null;
    }
    const t = data.target;
    defaultDir = path.join(root, 'logs', 'resumes', t?.company && t?.role ? [slug(t.company) || 'company', slug(t.role) || 'role', slug(t.job_id)].filter(Boolean).join('-') : 'base');
  } else if (ext === '.html' || ext === '.htm') { html = raw; kind = documentKind(html); defaultDir = path.dirname(file); }
  else throw new Error('render-cv accepts a tailored .html file or a .json payload.');
  const problems = htmlProblems(html);
  if (problems.length) throw new Error(`Render refused: ${problems.join('; ')}`);
  const hasBaseline = ['context/resume-data.json', 'context/profile.md', 'context/cv.md'].some(rel => fs.existsSync(path.join(root, rel)));
  if (kind === 'resume' && hasBaseline) {
    const audit = verifyTailoredCv(root, file);
    if (!audit.ok) throw new Error(`Fact-check blocked rendering: ${audit.errors.slice(0, 5).join('; ')}`);
    for (const w of audit.warnings) say(`Warning: ${w}`, '33');
  }
  const blocks = htmlToBlocks(html);
  if (!blocks.length) throw new Error('Render refused: no readable headings, paragraphs or bullets found.');
  const dir = outDir ? path.resolve(process.cwd(), outDir) : defaultDir;
  safePath(dir); fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const base = kind === 'cover_letter' ? 'cover-letter' : 'resume';
  const files = {};
  const out = (extension, data) => { const target = path.join(dir, `${base}.${extension}`); write(target, data); files[extension] = target; };
  out('html', html); out('doc', htmlToWordDoc(html)); out('docx', blocksToDocx(blocks)); out('txt', blocksToText(blocks));
  if (notes) {
    const list = items => (Array.isArray(items) && items.length ? items.map(x => `- ${String(x).replace(/\s+/g, ' ')}`).join('\n') : '- (none recorded)');
    const target = path.join(dir, 'tailoring-notes.md');
    write(target, `# Tailoring notes\n\n## What the job description asked for\n${list(notes.jd_asked)}\n\n## What changed in this CV version\n${list(notes.changes)}\n\n## Skill gaps (not claimed in the CV)\n${list(notes.gaps)}\n`);
    files.notes = target;
  }
  let pdfStatus = 'skipped', pdfBytes = null, pdfWords = null;
  if (pdf) {
    const chromium = await loadChromium();
    let buffer = null;
    if (chromium) { try { buffer = await renderPdf(chromium, html); } catch { buffer = null; } }
    if (!buffer) pdfStatus = 'unavailable';
    else {
      out('pdf', buffer); pdfBytes = buffer.length;
      const check = assessText(extractPdfText(buffer).text); pdfWords = check.words;
      pdfStatus = pdfBytes > 200 * 1024 ? 'too_large' : check.quality === 'readable' || (kind === 'cover_letter' && check.words >= 50) ? 'ok' : 'unreadable';
    }
  }
  const report = path.join(dir, `${base}.render-report.json`);
  write(report, JSON.stringify({ kind, source: file, files, pdf: pdfStatus, pdf_bytes: pdfBytes, pdf_words: pdfWords, rendered_at: new Date().toISOString() }, null, 2) + '\n');
  for (const [key, value] of Object.entries(files)) say(`${key.padEnd(5)} ${value}`, '36');
  if (pdfStatus === 'ok') say(`PDF ready (${Math.round(pdfBytes / 1024)} KB, text selectable). Upload this exact absolute path.`);
  else if (pdfStatus === 'unavailable') { say('PDF not produced: Chromium/Playwright is not available here. Use Playwright MCP print, or open the .html in Chrome -> Print -> Save as PDF (A4, no headers).', '33'); process.exitCode = 2; }
  else if (pdfStatus === 'too_large') { say('PDF is over the 200 KB budget; do not upload it. Shorten content or remove custom styling and render again.', '33'); process.exitCode = 4; }
  else if (pdfStatus === 'unreadable') { say('PDF text could not be verified as readable; inspect it before any upload.', '33'); process.exitCode = 4; }
  say(`Report: ${report}`, '36');
}
async function skillsCommand(sub, rest) {
  if (!sub || sub === 'help') {
    say('job-hunter skills <list|validate|sync|install <source> [name...]|enable <name>|disable <name>|export --ide <claude|cursor|antigravity|windsurf|all>> [--force] [--global]');
    return;
  }
  if (sub === 'list') {
    const manifest = readManifest(root);
    console.log(formatList(manifest));
    return;
  }
  if (sub === 'sync') {
    const res = syncSkills(root);
    say(`Synced ${res.manifest.skills.length} skills (${res.changed} generated file(s) updated).`);
    return;
  }
  if (sub === 'validate') {
    const res = validateSkills(root, { checkGenerated: true });
    for (const w of res.warnings) say(`[warn] ${w.file}: ${w.message}`, '33');
    for (const e of res.errors) say(`[fail] ${e.file}: ${e.message}`, '31');
    if (res.errors.length) { process.exitCode = 1; throw new Error(`Skill validation failed (${res.errors.length} error(s)).`); }
    say(`Validated ${res.skills.length} skills with 0 errors (${res.warnings.length} warning(s)).`);
    return;
  }
  if (sub === 'install') {
    const [src, ...only] = rest;
    const res = await installSkills(root, src, { only, force: Boolean(options['--force']), home });
    for (const item of res.installed) say(`Installed ${item.name} -> ${item.path} (disabled until reviewed; run skills enable ${item.name})`);
    for (const skip of res.skipped) say(`Skipped ${skip}`, '33');
    if (!res.installed.length && res.skipped.length) throw new Error('No skills were installed.');
    return;
  }
  if (sub === 'enable' || sub === 'disable') {
    if (!rest[0]) throw new Error(`Usage: skills ${sub} <skill-name>`);
    setEnabled(root, rest[0], sub === 'enable', { home });
    say(`Skill "${rest[0]}" ${sub}d.`);
    return;
  }
  if (sub === 'export') {
    const results = exportSkills(root, { ide: options.ide, global: Boolean(global), home });
    for (const r of results) {
      say(`Exported ${r.ide} -> ${r.dir} (written: ${r.written}, unchanged: ${r.unchanged}, removed: ${r.removed})`);
      for (const c of r.conflicts) say(`Preserved non-generated file: ${c}`, '33');
    }
    return;
  }
  throw new Error(`Unknown skills subcommand "${sub}". Use: list, validate, sync, install, enable, disable, export.`);
}
function verifyCvCommand(input) {
  if (!input) throw new Error('Usage: verify-cv <tailored-file> [--profile FILE] [--resume-data FILE] [--strict-humanize]');
  const result = verifyTailoredCv(root, input, {
    profilePath: options.profile,
    resumeDataPath: options.resumeData,
    strictHumanize: Boolean(options['--strict-humanize']),
  });
  for (const w of result.warnings) say(`[warn] ${w}`, '33');
  for (const e of result.errors) say(`[fail] ${e}`, '31');
  if (!result.ok) throw new Error(`Fact-check failed (${result.errors.length} issue(s)).`);
  say(`Fact-check passed against ${result.sources.join(', ')}.`);
}
async function pullAtsCommand() {
  const boards = options.boards.map(spec => {
    const idx = spec.indexOf(':');
    if (idx <= 0) throw new Error(`Invalid --board "${spec}". Use <greenhouse|lever|ashby>:<token>.`);
    const platform = spec.slice(0, idx).toLowerCase();
    const token = spec.slice(idx + 1);
    if (!ATS_PROVIDERS.has(platform)) throw new Error(`Unsupported ATS "${platform}". Use greenhouse, lever, or ashby.`);
    return { platform, token };
  });
  const limit = options.limit ? Number(options.limit) : 50;
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) throw new Error('--limit must be an integer between 1 and 200.');
  const result = await pullAts(root, {
    boards,
    roles: options.roles,
    locations: options.locations,
    limit,
    includeDisabled: Boolean(options['--all']),
    outFile: options.out || null,
  });
  for (const e of result.errors) say(`[warn] ${e}`, '33');
  console.log(formatHarvestTable(result));
}
try {
  if (Number(process.versions.node.split('.')[0]) < 18) throw new Error('Node.js 18+ is required.');
  if (argError) throw new Error(argError);
  if (argv.includes('--help') || argv.includes('-h') || command === 'help') say('job-hunter init [--global|-g] | doctor [--global] | login [--global] | sync-mcp [--global] | add-platform NAME [--global] | bundle-prompt [--global] | parse-cv [FILE] [--global] | render-cv FILE.html|FILE.json [--out-dir DIR] [--no-pdf] [--global] | verify-cv FILE [--strict-humanize] | pull-ats [--board ats:token] [--role KW] [--location LOC] [--limit N] [--all] | skills <list|validate|sync|install|enable|disable|export> [--global]');
  else if (command === 'init') init();
  else if (command === 'doctor') doctor();
  else if (command === 'login') login();
  else if (command === 'sync-mcp') syncMcp();
  else if (command === 'add-platform') addPlatform(positional[1]);
  else if (command === 'bundle-prompt') bundlePrompt();
  else if (command === 'parse-cv') parseCv(positional[1]);
  else if (command === 'render-cv') await renderCv(positional[1], { outDir: options.outDir, pdf: !options['--no-pdf'] });
  else if (command === 'verify-cv') verifyCvCommand(positional[1]);
  else if (command === 'pull-ats') await pullAtsCommand();
  else if (command === 'skills') await skillsCommand(positional[1], positional.slice(2));
  else throw new Error('Unknown command. Use --help.');
} catch (error) {
  // Errors are controlled messages only: never emit parsing input, env, configs or stack traces.
  say(`Job Hunter OS: ${error instanceof Error && !/Unexpected token|JSON/.test(error.message) ? error.message : 'Operation refused; check configuration syntax privately.'}`, '31');
  process.exitCode = 1;
}
