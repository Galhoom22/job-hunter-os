#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';
import { auditReadiness } from './readiness.mjs';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const home = os.homedir();
const argv = process.argv.slice(2);
const global = argv.includes('--global') || argv.includes('-g');
const flags = new Set(['--global', '-g', '--help', '-h']);
const positional = argv.filter(a => !flags.has(a));
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
  for (const dir of ['skills', 'prompts', 'templates', 'config', 'docs', 'schemas', 'scripts', 'bin', 'commands', 'mcp']) copyTree(path.join(source, dir), path.join(root, dir), name => !name.includes('import.json') && name !== 'tests');
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
try {
  if (Number(process.versions.node.split('.')[0]) < 18) throw new Error('Node.js 18+ is required.');
  if (argv.some(a => a.startsWith('-') && !flags.has(a))) throw new Error('Unknown option. Use --help.');
  if (argv.includes('--help') || argv.includes('-h') || command === 'help') say('job-hunter init [--global|-g] | doctor [--global] | login [--global] | sync-mcp [--global] | add-platform NAME [--global]');
  else if (command === 'init') init();
  else if (command === 'doctor') doctor();
  else if (command === 'login') login();
  else if (command === 'sync-mcp') syncMcp();
  else if (command === 'add-platform') addPlatform(positional[1]);
  else throw new Error('Unknown command. Use --help.');
} catch (error) {
  // Errors are controlled messages only: never emit parsing input, env, configs or stack traces.
  say(`Job Hunter OS: ${error instanceof Error && !/Unexpected token|JSON/.test(error.message) ? error.message : 'Operation refused; check configuration syntax privately.'}`, '31');
  process.exitCode = 1;
}
