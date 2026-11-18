import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { outreachAllowed } from '../../bin/agent-rules.mjs';
const cli = fileURLToPath(new URL('../../bin/job-hunter.mjs', import.meta.url));
function fixture(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'job-hunter-cli-'));
  const home = path.join(base, 'home'); const cwd = path.join(base, 'project');
  fs.mkdirSync(home); fs.mkdirSync(cwd);
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8', env: { ...process.env, HOME: home, USERPROFILE: home, NOTION_TOKEN: '', NO_COLOR: '1' } });
  return { base, home, cwd, run };
}
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
test('local init, doctor, sync and disabled platform registration preserve owner data', t => {
  const f = fixture(t);
  assert.equal(f.run('init').status, 0);
  assert.ok(fs.existsSync(path.join(f.cwd, 'skills', '00-onboarding-chat.md')));
  assert.ok(fs.existsSync(path.join(f.cwd, '.agent', 'workflows', 'apply-url.md')));
  assert.equal(read(path.join(f.cwd, 'logs', 'applications-log.json')).length, 0);
  fs.writeFileSync(path.join(f.cwd, 'context', 'profile.md'), 'Owner facts to preserve');
  assert.equal(f.run('init').status, 0);
  assert.equal(fs.readFileSync(path.join(f.cwd, 'context', 'profile.md'), 'utf8'), 'Owner facts to preserve');
  const doctor = f.run('doctor');
  assert.equal(doctor.status, 1); assert.match(doctor.stdout, /placeholder heuristic/);
  assert.equal(f.run('sync-mcp').status, 0);
  assert.equal(f.run('add-platform', 'local-board').status, 0);
  assert.match(fs.readFileSync(path.join(f.cwd, 'context', 'targets.yaml'), 'utf8'), /job-hunter-platform: local-board\n  - name:[\s\S]*platform: other\n    enabled: false/);
  assert.equal(f.run('add-platform', 'local-board').status, 1);
  assert.equal(f.run('add-platform', '../../escape').status, 1);
});
test('global init resolves all profiles and commands to home, accessible from unrelated cwd', t => {
  const f = fixture(t);
  assert.equal(f.run('init', '--global').status, 0);
  const root = path.join(f.home, '.job-hunter-os');
  const config = read(path.join(f.home, '.claude.json'));
  assert.ok(config.mcpServers.playwright.args.includes(`--user-data-dir=${path.join(root, 'browser-profile')}`));
  for (const name of ['setup','daily-run','tailor-cv','apply-url','weekly-report','linkedin-growth']) {
    const text = fs.readFileSync(path.join(f.home, '.claude', 'commands', name + '.md'), 'utf8');
    assert.ok(text.includes(root)); assert.ok(!text.includes('{{AGENT_HOME}}'));
  }
  assert.equal(f.run('sync-mcp').status, 0);
  assert.ok(f.run('doctor').stdout.includes(root));
});
test('MCP merge preserves unrelated servers, Claude settings and existing Notion secrets', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.home, '.claude.json'), JSON.stringify({ theme: 'keep', mcpServers: { custom: { command: 'custom' }, notion: { env: { NOTION_TOKEN: 'synthetic-private-marker' } } } }));
  const result = f.run('init', '--global'); assert.equal(result.status, 0);
  const config = read(path.join(f.home, '.claude.json'));
  assert.equal(config.theme, 'keep'); assert.equal(config.mcpServers.custom.command, 'custom');
  assert.equal(config.mcpServers.notion.env.NOTION_TOKEN, 'synthetic-private-marker');
  assert.ok(!result.stdout.includes('synthetic-private-marker'));
  assert.ok(!read(path.join(f.home, '.cursor', 'mcp.json')).mcpServers.notion);
});
test('malformed JSON and same-name conflicting server fail without overwriting IDE configs', t => {
  const f = fixture(t); const file = path.join(f.home, '.claude.json');
  fs.writeFileSync(file, '{invalid');
  assert.equal(f.run('init', '--global').status, 1); assert.equal(fs.readFileSync(file, 'utf8'), '{invalid');
  fs.writeFileSync(file, JSON.stringify({ mcpServers: { playwright: { command: 'keep-me' } } }));
  assert.equal(f.run('sync-mcp', '--global').status, 1);
  assert.equal(read(file).mcpServers.playwright.command, 'keep-me');
});
test('symlinked destination cannot redirect private profile writes', t => {
  if (process.platform === 'win32') return t.skip('Symlink creation may require elevated Windows permissions');
  const f = fixture(t); fs.symlinkSync(f.base, path.join(f.cwd, 'context'));
  assert.equal(f.run('init').status, 1);
  assert.ok(!fs.existsSync(path.join(f.base, 'profile.md')));
});
test('doctor returns success for completed structural fixture without claiming live auth', t => {
  const f = fixture(t); assert.equal(f.run('init').status, 0);
  fs.writeFileSync(path.join(f.cwd, 'context', 'profile.md'), '# Verified owner\n- full_name: Synthetic Candidate\n- current_title: Engineer\n');
  fs.writeFileSync(path.join(f.cwd, 'context', 'form-answers.yaml'), 'owner_verified: true\nresume_pdf_path: "./assets/resume.pdf"\nquestions: []\nskills_years: {}\neeo: {}\n');
  fs.writeFileSync(path.join(f.cwd, 'assets', 'resume.pdf'), '%PDF-1.7 synthetic');
  fs.mkdirSync(path.join(f.cwd, 'browser-profile', 'Default'));
  const result = f.run('doctor'); assert.equal(result.status, 0); assert.match(result.stdout, /not proof of logged-in sessions/);
});
test('outreach guard accepts exactly 75 words and rejects 76', () => {
  assert.equal(outreachAllowed(Array(75).fill('word').join(' ')), true);
  assert.equal(outreachAllowed(Array(76).fill('word').join(' ')), false);
  assert.equal(outreachAllowed(' '), false);
});
test('unsupported multi-key YAML cannot be corrupted by registration', t => {
  const f = fixture(t); assert.equal(f.run('init').status, 0);
  const file = path.join(f.cwd, 'context', 'targets.yaml');
  const original = 'targets:\n  - name: Existing\nsettings:\n  enabled: false\n';
  fs.writeFileSync(file, original);
  assert.equal(f.run('add-platform', 'safe-board').status, 1);
  assert.equal(fs.readFileSync(file, 'utf8'), original);
});
