// Skill package manager for Job Hunter OS. Node built-ins only (no YAML library):
// the frontmatter grammar is a deliberately small, YAML-compatible subset.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

export const SECTIONS = [
  'When to Use & Preconditions',
  'Deterministic Step-by-Step Execution',
  'Anti-Patterns (What NEVER To Do) & Self-Verification Check',
];
export const REQUIRED_KEYS = ['name', 'version', 'description', 'triggers', 'requires_mcp', 'preconditions', 'requires_skills', 'verification'];
const LIST_KEYS = new Set(['triggers', 'requires_mcp', 'preconditions', 'requires_skills', 'verification']);
const KNOWN_EXTRA_KEYS = new Set(['license', 'metadata', 'allowed-tools', 'compatibility']);
export const MCP_VALUES = new Set(['playwright', 'notion', 'none']);
export const IDES = ['claude', 'cursor', 'antigravity', 'windsurf'];
export const EXPORT_MARKER = '<!-- job-hunter-os:generated-skill-export -->';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const MANIFEST = 'skills-manifest.json';
const REGISTRY = 'REGISTRY.md';
const TRUST = path.join('community', '.trust.json');
const EXPORTS_STATE = '.job-hunter-skill-exports.json';
const CATEGORY_ORDER = ['core', 'meta', 'platform', 'ats', 'community'];
const CATEGORY_TITLES = { core: 'Core workflow skills', meta: 'Meta-skills (agent reliability)', platform: 'Job-board playbooks', ats: 'Employer ATS playbooks', community: 'Community skills' };

// ---------- frontmatter ----------
function unquote(raw, lineNo) {
  const v = raw.trim();
  if (v.startsWith('"')) {
    if (!v.endsWith('"') || v.length < 2) throw new Error(`line ${lineNo}: unterminated double-quoted string`);
    try { return JSON.parse(v); } catch { throw new Error(`line ${lineNo}: invalid double-quoted string`); }
  }
  if (v.startsWith("'")) {
    if (!v.endsWith("'") || v.length < 2) throw new Error(`line ${lineNo}: unterminated single-quoted string`);
    return v.slice(1, -1).replace(/''/g, "'");
  }
  const plain = v.replace(/\s+#.*$/, '').trim();
  if (/^[>|]/.test(plain)) throw new Error(`line ${lineNo}: block scalars are not supported; use one quoted line`);
  if (/^[[{&*!%@`]/.test(plain) && plain !== '[]') throw new Error(`line ${lineNo}: unsupported YAML syntax; quote the value`);
  if (/:\s/.test(plain) || plain.endsWith(':')) throw new Error(`line ${lineNo}: a plain value may not contain ": "; quote it`);
  return plain;
}

/** Parse leading `---` frontmatter. Returns { data, body, error }. */
export function parseFrontmatter(text) {
  const src = String(text).replace(/^\uFEFF/, '');
  const lines = src.split(/\r?\n/);
  if (lines[0] !== '---') return { data: null, body: src, error: 'missing YAML frontmatter (file must start with ---)' };
  const end = lines.indexOf('---', 1);
  if (end < 0) return { data: null, body: src, error: 'unterminated YAML frontmatter (no closing ---)' };
  const data = {};
  let current = null; // key awaiting list/map items
  try {
    for (let i = 1; i < end; i++) {
      const line = lines[i]; const n = i + 1;
      if (!line.trim() || /^\s*#/.test(line)) continue;
      if (/\t/.test(line)) throw new Error(`line ${n}: tabs are not allowed`);
      const top = /^([A-Za-z_][A-Za-z0-9_-]*):(?:\s+(.*))?$/.exec(line);
      if (top) {
        const [, key, rest = ''] = top;
        if (Object.prototype.hasOwnProperty.call(data, key)) throw new Error(`line ${n}: duplicate key ${key}`);
        if (rest.trim() === '' || /^#/.test(rest.trim())) { data[key] = null; current = key; }
        else if (rest.trim() === '[]') { data[key] = []; current = null; }
        else { data[key] = unquote(rest, n); current = null; }
        continue;
      }
      const item = /^\s+-\s+(.*)$/.exec(line) || /^\s+-$/.exec(line);
      if (item && current) {
        if (data[current] === null) data[current] = [];
        if (!Array.isArray(data[current])) throw new Error(`line ${n}: mixed list and map under ${current}`);
        const value = item[1] === undefined ? '' : unquote(item[1], n);
        data[current].push(value);
        continue;
      }
      const nested = /^\s+([A-Za-z_][A-Za-z0-9_-]*):(?:\s+(.*))?$/.exec(line);
      if (nested && current) {
        if (data[current] === null) data[current] = {};
        if (Array.isArray(data[current])) throw new Error(`line ${n}: mixed list and map under ${current}`);
        data[current][nested[1]] = nested[2] === undefined ? '' : unquote(nested[2], n);
        continue;
      }
      throw new Error(`line ${n}: unsupported frontmatter syntax`);
    }
  } catch (error) { return { data: null, body: lines.slice(end + 1).join('\n'), error: `invalid frontmatter — ${error.message}` }; }
  for (const key of Object.keys(data)) if (data[key] === null) data[key] = LIST_KEYS.has(key) ? [] : '';
  return { data, body: lines.slice(end + 1).join('\n'), error: null };
}

function scalar(value) {
  const v = String(value);
  if (v === '' || /^[\s>|[\]{}&*!%@`'"#,?-]/.test(v) || /:\s|\s#|:$|\s$/.test(v) || /^(?:true|false|null|yes|no|on|off|~|[-+]?\d[\d._]*(?:e[-+]?\d+)?)$/i.test(v)) return JSON.stringify(v);
  return v;
}
/** Serialize frontmatter data (strings and string lists) in canonical key order. */
export function serializeFrontmatter(data) {
  const keys = [...REQUIRED_KEYS.filter(k => k in data), ...Object.keys(data).filter(k => !REQUIRED_KEYS.includes(k))];
  const out = ['---'];
  for (const key of keys) {
    const value = data[key];
    if (key === 'version') out.push(`version: ${JSON.stringify(String(value))}`);
    else if (Array.isArray(value)) { if (!value.length) out.push(`${key}: []`); else { out.push(`${key}:`); for (const item of value) out.push(`  - ${scalar(item)}`); } }
    else if (value && typeof value === 'object') { out.push(`${key}:`); for (const [k, v] of Object.entries(value)) out.push(`  ${k}: ${scalar(v)}`); }
    else out.push(`${key}: ${scalar(value)}`);
  }
  out.push('---');
  return out.join('\n') + '\n';
}

// ---------- discovery ----------
const isDir = p => { try { return fs.lstatSync(p).isDirectory(); } catch { return false; } };
const isFile = p => { try { return fs.lstatSync(p).isFile(); } catch { return false; } };
const toPosix = p => p.split(path.sep).join('/');

/** Find every skill file under <root>/skills: flat `*.md` files and `<name>/SKILL.md` folders. */
export function discoverSkills(root) {
  const skillsDir = path.join(root, 'skills');
  const found = [];
  const walk = (dir, depth) => {
    if (depth > 4) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isSymbolicLink() || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (isFile(path.join(full, 'SKILL.md'))) found.push({ file: path.join(full, 'SKILL.md'), layout: 'directory', expectedName: entry.name });
        else walk(full, depth + 1);
      } else if (entry.isFile() && entry.name.endsWith('.md') && !/^(?:REGISTRY|README)\.md$/i.test(entry.name)) {
        found.push({ file: full, layout: 'flat', expectedName: entry.name.replace(/\.md$/, '').replace(/^\d+-/, ''), template: entry.name.startsWith('_') });
      }
    }
  };
  if (isDir(skillsDir)) walk(skillsDir, 0);
  return found.map(s => {
    const rel = toPosix(path.relative(root, s.file));
    const inner = rel.slice('skills/'.length);
    const category = inner.startsWith('community/') ? 'community' : inner.startsWith('platforms/') ? 'platform' : inner.startsWith('ats/') ? 'ats' : /^meta-/.test(s.expectedName) ? 'meta' : 'core';
    return { ...s, rel, category, template: Boolean(s.template) };
  });
}

export function readTrust(root) {
  const file = path.join(root, 'skills', TRUST);
  if (!isFile(file)) return {};
  try { const v = JSON.parse(fs.readFileSync(file, 'utf8')); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch { return {}; }
}
const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');

export function loadSkills(root) {
  const trust = readTrust(root);
  return discoverSkills(root).map(s => {
    const text = fs.readFileSync(s.file, 'utf8');
    const { data, body, error } = parseFrontmatter(text);
    let enabled = true, review = null;
    if (s.category === 'community') {
      const record = data?.name ? trust[data.name] : undefined;
      enabled = Boolean(record?.enabled && record.sha256 === sha256(fs.readFileSync(s.file)));
      review = !record ? 'not_registered' : record.enabled && !enabled ? 'changed_since_review' : enabled ? 'reviewed' : 'review_required';
    }
    return { ...s, text, data, body, error, enabled, review, source: s.category === 'community' ? trust[data?.name]?.source ?? null : null };
  });
}

// ---------- validation ----------
function headings(body) {
  const out = []; let fence = false;
  for (const [i, line] of body.split(/\r?\n/).entries()) {
    if (/^\s*(```|~~~)/.test(line)) { fence = !fence; continue; }
    if (fence) continue;
    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) out.push({ level: m[1].length, text: m[2], line: i });
  }
  return out;
}
const REF = /(?<![\w./-])((?:skills|docs|templates|schemas|bin|scripts|config|prompts|commands|mcp|extension)\/[A-Za-z0-9_./-]*[A-Za-z0-9_-]\.(?:md|mjs|ts|json|yaml|html))(?![\w/-])/g;
const BARE = /(?<![\w./<-])([a-z0-9][a-z0-9-]*\.md)(?![\w/-])/g;
function references(root, body, allFiles) {
  const problems = [];
  const plain = body.replace(/https?:\/\/\S+/g, '');
  for (const m of plain.matchAll(REF)) if (!fs.existsSync(path.join(root, m[1]))) problems.push(m[1]);
  // Bare file names inside `inline code` are usually runtime artifacts (resume.md, tailoring-notes.md); only prose mentions must resolve.
  for (const m of plain.replace(/`[^`\n]*`/g, '').matchAll(BARE)) if (!allFiles.has(m[1])) problems.push(m[1]);
  return [...new Set(problems)];
}
function markdownNames(root) {
  const names = new Set(['AGENTS.md', 'README.md', 'CLAUDE.md', 'SKILL.md']);
  const walk = dir => { if (!isDir(dir)) return; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (e.isSymbolicLink() || e.name === 'node_modules' || e.name.startsWith('.')) continue; const f = path.join(dir, e.name); if (e.isDirectory()) walk(f); else if (e.name.endsWith('.md')) names.add(e.name); } };
  for (const d of ['skills', 'docs', 'commands', 'prompts', 'mcp', 'extension', 'templates', 'context']) walk(path.join(root, d));
  return names;
}

/** Lint every skill. Core/meta/platform/ATS skills are strict; community skills only need name + description (agent_skills standard). */
export function validateSkills(root, { checkGenerated = true } = {}) {
  const skills = loadSkills(root);
  const errors = []; const warnings = [];
  const mdNames = markdownNames(root);
  const names = new Map();
  for (const s of skills) if (s.data?.name && !s.template) names.set(s.data.name, (names.get(s.data.name) || 0) + 1);
  for (const s of skills) {
    const strict = s.category !== 'community';
    const err = msg => (strict ? errors : warnings).push({ file: s.rel, message: msg });
    const hard = msg => errors.push({ file: s.rel, message: msg });
    if (s.error) { hard(s.error); continue; }
    const d = s.data;
    if (!d.name || typeof d.name !== 'string') hard('name is required');
    else {
      if (!SLUG.test(d.name) || d.name.length > 64) hard('name must be a lowercase-hyphen slug of at most 64 characters');
      if (!s.template && d.name !== s.expectedName) (s.layout === 'directory' ? hard : err)(`name "${d.name}" must match ${s.layout === 'directory' ? 'its folder' : 'its file name'} ("${s.expectedName}")`);
      if (!s.template && names.get(d.name) > 1) hard(`duplicate skill name "${d.name}"`);
    }
    if (typeof d.description !== 'string' || d.description.trim().length < 20 || d.description.length > 1024) hard('description must be a 20–1024 character string');
    else if (strict && !/\bwhen\b/i.test(d.description)) err('description must say WHEN to load the skill');
    for (const key of REQUIRED_KEYS.slice(1)) if (!(key in d)) err(`missing frontmatter key: ${key}`);
    if ('version' in d && (typeof d.version !== 'string' || !SEMVER.test(d.version))) err('version must be a quoted semantic version such as "1.0.0"');
    for (const key of LIST_KEYS) {
      if (!(key in d)) continue;
      if (!Array.isArray(d[key]) || d[key].some(v => typeof v !== 'string' || !v.trim())) { err(`${key} must be a list of non-empty strings`); continue; }
      if (key !== 'requires_skills' && !d[key].length) err(`${key} must list at least one item`);
    }
    if (Array.isArray(d.requires_mcp)) {
      const bad = d.requires_mcp.filter(v => !MCP_VALUES.has(v));
      if (bad.length) err(`requires_mcp has unknown server(s): ${bad.join(', ')} (allowed: playwright, notion, none)`);
      if (d.requires_mcp.includes('none') && d.requires_mcp.length > 1) err('requires_mcp: "none" cannot be combined with servers');
    }
    if (Array.isArray(d.requires_skills)) for (const dep of d.requires_skills) {
      if (dep === d.name) err('requires_skills must not reference itself');
      else if (!names.has(dep)) err(`requires_skills references unknown skill "${dep}"`);
    }
    for (const key of Object.keys(d)) if (!REQUIRED_KEYS.includes(key) && !KNOWN_EXTRA_KEYS.has(key)) warnings.push({ file: s.rel, message: `unknown frontmatter key: ${key}` });
    const h2 = headings(s.body).filter(h => h.level === 2).map(h => h.text);
    let last = -1;
    for (const section of SECTIONS) {
      const at = h2.indexOf(section);
      if (at < 0) err(`missing required section "## ${section}"`);
      else if (at < last) err(`section "## ${section}" is out of order`);
      else last = at;
    }
    if (strict && SECTIONS.every(sec => h2.includes(sec))) {
      const lines = s.body.split(/\r?\n/);
      const hs = headings(s.body).filter(h => h.level === 2);
      for (const section of SECTIONS) {
        const idx = hs.findIndex(h => h.text === section);
        const next = hs[idx + 1];
        const content = lines.slice(hs[idx].line + 1, next ? next.line : lines.length).join('\n').trim();
        if (content.length < 40) err(`section "## ${section}" is empty`);
      }
    }
    if (strict) for (const ref of references(root, s.body, mdNames)) err(`broken reference: ${ref}`);
  }
  if (checkGenerated) {
    const { manifestText, registryText } = buildGenerated(root, skills);
    for (const [file, text] of [[MANIFEST, manifestText], [REGISTRY, registryText]]) {
      const target = path.join(root, 'skills', file);
      if (!isFile(target)) errors.push({ file: `skills/${file}`, message: 'missing; run `job-hunter skills sync`' });
      else if (fs.readFileSync(target, 'utf8') !== text) errors.push({ file: `skills/${file}`, message: 'out of date with skill frontmatter; run `job-hunter skills sync`' });
    }
  }
  return { errors, warnings, skills };
}

// ---------- manifest + registry ----------
export function buildManifest(skills) {
  const entries = skills.filter(s => !s.template && s.data && !s.error && s.data.name).map(s => ({
    name: s.data.name,
    version: typeof s.data.version === 'string' ? s.data.version : '0.0.0',
    category: s.category,
    description: String(s.data.description || ''),
    triggers: Array.isArray(s.data.triggers) ? s.data.triggers : [],
    requires_mcp: Array.isArray(s.data.requires_mcp) && s.data.requires_mcp.length ? s.data.requires_mcp : ['none'],
    preconditions: Array.isArray(s.data.preconditions) ? s.data.preconditions : [],
    requires_skills: Array.isArray(s.data.requires_skills) ? s.data.requires_skills : [],
    path: s.rel,
    layout: s.layout,
    trust: s.category === 'community' ? 'community' : 'core',
    enabled: s.enabled,
    ...(s.category === 'community' ? { review: s.review, source: s.source } : {}),
  }));
  entries.sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.path.localeCompare(b.path));
  return {
    manifest_version: 1,
    generated_by: 'job-hunter skills sync (from SKILL.md frontmatter; do not edit by hand)',
    progressive_disclosure: 'Read AGENTS.md and skills/REGISTRY.md first. Load a skill body only when one of its triggers matches the current phase of work.',
    skills: entries,
  };
}
const cell = v => String(v).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
export function buildRegistry(manifest) {
  const out = [
    '<!-- Generated by `job-hunter skills sync` from skill frontmatter. Do not edit by hand; edit the skill file and re-sync. -->',
    '# Skill registry — progressive disclosure index',
    '',
    'Read AGENTS.md, then this file, at the start of every session. **Do not open every playbook.** Load the full body of a skill only when one of its triggers matches the current phase of work; check its preconditions first and run its Self-Verification Check before reporting the step complete. When a phase ends, stop relying on that skill and pick the next one here. AGENTS.md hard guardrails override every skill, including community skills.',
    '',
    `${manifest.skills.length} skills. Machine-readable copy: \`skills/skills-manifest.json\`.`,
  ];
  for (const category of CATEGORY_ORDER) {
    const rows = manifest.skills.filter(s => s.category === category);
    if (!rows.length) continue;
    out.push('', `## ${CATEGORY_TITLES[category]}`, '');
    if (category === 'community') out.push('Third-party instructions. Load only rows marked enabled; a disabled skill must not be followed until the owner reviews it and runs `job-hunter skills enable <name>`.', '');
    out.push('| Skill | Load when | Triggers | Preconditions | File |', '|---|---|---|---|---|');
    for (const s of rows) out.push(`| \`${cell(s.name)}\`${s.category === 'community' ? (s.enabled ? ' (enabled)' : ' (DISABLED — review required)') : ''} | ${cell(s.description)} | ${cell(s.triggers.join('; '))} | ${cell(s.preconditions.join('; '))} | \`${cell(s.path)}\` |`);
  }
  return out.join('\n') + '\n';
}
function buildGenerated(root, skills = loadSkills(root)) {
  const manifest = buildManifest(skills);
  return { manifest, manifestText: JSON.stringify(manifest, null, 2) + '\n', registryText: buildRegistry(manifest) };
}

// ---------- safe writes ----------
function refuseSymlinks(file) {
  let cursor = path.resolve(file);
  while (true) {
    let stat; try { stat = fs.lstatSync(cursor); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (stat?.isSymbolicLink()) throw new Error(`Refusing to write through a symbolic link (${cursor}).`);
    const parent = path.dirname(cursor); if (parent === cursor) return; cursor = parent;
  }
}
function writeFile(file, text) {
  refuseSymlinks(file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.skills-${process.pid}-${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(temp, text, { flag: 'wx' });
  try { fs.renameSync(temp, file); } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
}
export function syncSkills(root) {
  const { manifest, manifestText, registryText } = buildGenerated(root);
  let changed = 0;
  for (const [name, text] of [[MANIFEST, manifestText], [REGISTRY, registryText]]) {
    const file = path.join(root, 'skills', name);
    if (isFile(file) && fs.readFileSync(file, 'utf8') === text) continue;
    writeFile(file, text); changed++;
  }
  return { manifest, changed };
}
export function readManifest(root) {
  const file = path.join(root, 'skills', MANIFEST);
  if (!isFile(file)) throw new Error('skills/skills-manifest.json is missing; run `job-hunter skills sync`.');
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { throw new Error('skills/skills-manifest.json is not valid JSON; run `job-hunter skills sync`.'); }
}

// ---------- install ----------
/** Parse https://github.com/<owner>/<repo>[.git][/tree/<ref>[/<subpath>]] or github:<owner>/<repo>. */
export function parseGithubSource(source) {
  const short = /^github:([A-Za-z0-9-]{1,39})\/([A-Za-z0-9._-]{1,100})$/.exec(source);
  if (short) return { owner: short[1], repo: short[2].replace(/\.git$/, ''), ref: null, subpath: '' };
  let url; try { url = new URL(source); } catch { return null; }
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password || url.search || url.hash) return null;
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 2 || !/^[A-Za-z0-9-]{1,39}$/.test(parts[0]) || !/^[A-Za-z0-9._-]{1,100}$/.test(parts[1])) return null;
  const repo = parts[1].replace(/\.git$/, '');
  if (parts.length === 2) return { owner: parts[0], repo, ref: null, subpath: '' };
  if ((parts[2] !== 'tree' && parts[2] !== 'blob') || parts.length < 4) return null;
  const subpath = parts.slice(4).join('/');
  if (subpath.split('/').some(p => p === '..' || p === '.')) return null;
  if (!/^[A-Za-z0-9._/-]{1,200}$/.test(parts[3])) return null;
  return { owner: parts[0], repo, ref: parts[3], subpath: parts[2] === 'blob' ? path.posix.dirname(subpath) : subpath };
}
async function fetchGithub(gh, temp) {
  const dest = path.join(temp, 'repo');
  const git = spawnSync('git', ['clone', '--depth', '1', ...(gh.ref ? ['--branch', gh.ref] : []), '--', `https://github.com/${gh.owner}/${gh.repo}.git`, dest], { stdio: 'pipe', timeout: 180000, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
  if (git.status === 0) return dest;
  if (typeof fetch !== 'function') throw new Error('Download failed: git is unavailable and this Node.js has no fetch().');
  const response = await fetch(`https://codeload.github.com/${gh.owner}/${gh.repo}/tar.gz/${gh.ref ? encodeURIComponent(gh.ref) : 'HEAD'}`, { redirect: 'follow' });
  if (!response.ok) throw new Error(`Download failed (HTTP ${response.status}). Check the repository URL and that it is public.`);
  const buf = Buffer.from(await response.arrayBuffer());
  if (buf.length > 50 * 1048576) throw new Error('Repository archive is larger than 50 MB; install a specific /tree/<ref>/<folder> instead.');
  const archive = path.join(temp, 'repo.tar.gz'); fs.writeFileSync(archive, buf);
  fs.mkdirSync(dest);
  const tar = spawnSync('tar', ['-xzf', archive, '-C', dest, '--strip-components=1'], { stdio: 'pipe', timeout: 120000 });
  if (tar.status !== 0) throw new Error('Could not unpack the archive (git and tar are both unavailable or failed).');
  return dest;
}
function findSkillDirs(dir, depth = 0, out = []) {
  if (out.length >= 100 || depth > 5) return out;
  if (isFile(path.join(dir, 'SKILL.md'))) { out.push(dir); return out; }
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.isDirectory() && !e.isSymbolicLink() && !e.name.startsWith('.') && e.name !== 'node_modules') findSkillDirs(path.join(dir, e.name), depth + 1, out);
  }
  return out;
}
function collectFiles(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isSymbolicLink()) throw new Error(`contains a symbolic link (${path.relative(base, full)})`);
    if (e.isDirectory()) collectFiles(full, base, out);
    else if (e.isFile()) out.push(path.relative(base, full));
    if (out.length > 200) throw new Error('has more than 200 files');
  }
  return out;
}

/** Install agent_skills-compatible folders (each with SKILL.md) into skills/community/<name>/, disabled until reviewed. */
export async function installSkills(root, source, { only = [], force = false, home = os.homedir() } = {}) {
  if (!source) throw new Error('Usage: skills install <github-url|github:owner/repo|local-folder> [skill-name ...] [--force]');
  if (!isDir(path.join(root, 'skills'))) throw new Error('No skills/ folder here. Run init first or run from the agent home.');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'job-hunter-skills-'));
  try {
    let base, sourceLabel;
    const gh = /^(?:https?:|github:)/.test(source) ? parseGithubSource(source) : null;
    if (/^(?:https?:|github:)/.test(source)) {
      if (!gh) throw new Error('Only public https://github.com/<owner>/<repo>[/tree/<ref>/<folder>] URLs (no credentials or query strings) or local folders are supported.');
      base = path.join(await fetchGithub(gh, temp), gh.subpath);
      sourceLabel = `https://github.com/${gh.owner}/${gh.repo}${gh.ref ? `/tree/${gh.ref}${gh.subpath ? '/' + gh.subpath : ''}` : ''}`;
    } else {
      base = path.resolve(process.cwd(), source);
      if (isFile(base) && path.basename(base) === 'SKILL.md') base = path.dirname(base);
      if (!isDir(base)) throw new Error('Source folder not found (symbolic links are refused).');
      sourceLabel = `local:${path.basename(base)}`;
    }
    if (!isDir(base)) throw new Error('That path does not exist inside the downloaded repository.');
    const dirs = findSkillDirs(base);
    if (!dirs.length) throw new Error('No agent_skills-compatible folders (containing SKILL.md) were found.');
    const existing = new Map(loadSkills(root).filter(s => s.data?.name).map(s => [s.data.name, s]));
    const trustFile = path.join(root, 'skills', TRUST);
    const trust = readTrust(root);
    const installed = []; const skipped = [];
    for (const dir of dirs) {
      const label = path.relative(base, dir) || path.basename(dir);
      const { data, error } = parseFrontmatter(fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8'));
      if (error || !data?.name) { skipped.push(`${label}: ${error || 'SKILL.md has no name'}`); continue; }
      const name = String(data.name);
      if (only.length && !only.includes(name)) continue;
      if (!SLUG.test(name) || name.length > 64) { skipped.push(`${label}: invalid skill name`); continue; }
      if (typeof data.description !== 'string' || data.description.trim().length < 20) { skipped.push(`${name}: description missing or too short`); continue; }
      const prior = existing.get(name);
      if (prior && prior.category !== 'community') { skipped.push(`${name}: conflicts with a built-in skill (never replaced)`); continue; }
      if (prior && !force) { skipped.push(`${name}: already installed (use --force to replace; it will be disabled again)`); continue; }
      let files;
      try { files = collectFiles(dir); } catch (e) { skipped.push(`${name}: ${e.message}`); continue; }
      let total = 0; let tooBig = null;
      for (const f of files) { const size = fs.statSync(path.join(dir, f)).size; total += size; if (size > 1048576) tooBig = f; }
      if (tooBig || total > 5 * 1048576) { skipped.push(`${name}: files exceed the 1 MB per file / 5 MB per skill limit`); continue; }
      const dest = path.join(root, 'skills', 'community', name);
      const staging = path.join(root, 'skills', 'community', `.${name}.installing-${process.pid}`);
      refuseSymlinks(dest);
      fs.rmSync(staging, { recursive: true, force: true });
      for (const f of files) { const target = path.join(staging, f); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(path.join(dir, f), target, fs.constants.COPYFILE_EXCL); }
      fs.rmSync(dest, { recursive: true, force: true });
      fs.renameSync(staging, dest);
      trust[name] = { source: sourceLabel, installed_at: new Date().toISOString(), sha256: sha256(fs.readFileSync(path.join(dest, 'SKILL.md'))), enabled: false };
      installed.push({ name, path: toPosix(path.relative(root, path.join(dest, 'SKILL.md'))), files: files.length });
    }
    if (installed.length) writeFile(trustFile, JSON.stringify(trust, null, 2) + '\n');
    const sync = syncSkills(root);
    const exports = reExport(root, home);
    return { installed, skipped, manifest: sync.manifest, exports };
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
}

export function setEnabled(root, name, enabled, { home = os.homedir() } = {}) {
  const skill = loadSkills(root).find(s => s.data?.name === name);
  if (!skill) throw new Error(`Unknown skill "${name}".`);
  if (skill.category !== 'community') throw new Error('Built-in skills are always enabled; only community skills can be enabled or disabled.');
  const trust = readTrust(root);
  trust[name] = { ...(trust[name] || { source: 'unknown', installed_at: new Date().toISOString() }), enabled, sha256: sha256(fs.readFileSync(skill.file)), ...(enabled ? { reviewed_at: new Date().toISOString() } : {}) };
  writeFile(path.join(root, 'skills', TRUST), JSON.stringify(trust, null, 2) + '\n');
  const sync = syncSkills(root);
  return { manifest: sync.manifest, exports: reExport(root, home) };
}

// ---------- export ----------
function exportTargets(root, ide, isGlobal, home) {
  const base = isGlobal ? home : root;
  if (ide === 'claude') return { dir: path.join(base, '.claude', 'skills'), file: n => path.join(base, '.claude', 'skills', `jh-${n}`, 'SKILL.md'), owner: n => path.join(base, '.claude', 'skills', `jh-${n}`) };
  if (ide === 'cursor') return { dir: path.join(base, '.cursor', 'rules'), file: n => path.join(base, '.cursor', 'rules', `jh-${n}.mdc`) };
  if (ide === 'antigravity') { const dir = isGlobal ? path.join(home, '.antigravity', 'workflows') : path.join(root, '.agent', 'workflows'); return { dir, file: n => path.join(dir, `jh-${n}.md`) }; }
  if (ide === 'windsurf') return { dir: path.join(base, '.windsurf', 'rules'), file: n => path.join(base, '.windsurf', 'rules', `jh-${n}.md`) };
  throw new Error(`Unknown IDE "${ide}". Use one of: ${IDES.join(', ')}, all.`);
}
function exportText(ide, skill, skillPath, root, isGlobal) {
  const where = isGlobal ? skillPath : `\`${skillPath}\` (relative to this repository)`;
  const agents = isGlobal ? path.join(root, 'AGENTS.md') : 'AGENTS.md';
  const registry = isGlobal ? path.join(root, 'skills', 'REGISTRY.md') : 'skills/REGISTRY.md';
  const body = [
    EXPORT_MARKER,
    `# Job Hunter OS skill: ${skill.name}`,
    '',
    `Canonical instructions: ${where}. Agent home: ${isGlobal ? root : 'this repository'}.`,
    '',
    `1. If not already loaded this session, read ${agents} (hard guardrails override everything) and ${registry}.`,
    '2. Read the canonical skill file completely and follow it exactly, including its Preconditions and Self-Verification Check.',
    '3. Resolve context, logs and tools inside the agent home, never the active project.',
    '',
    `Generated pointer — edit the canonical skill, then run \`job-hunter skills export --ide ${ide}${isGlobal ? ' --global' : ''}\`.`,
  ].join('\n') + '\n';
  const desc = skill.description.length > 1000 ? skill.description.slice(0, 997) + '...' : skill.description;
  if (ide === 'claude') return serializeFrontmatter({ name: `jh-${skill.name}`, description: desc }) + '\n' + body;
  if (ide === 'cursor') return `---\ndescription: ${scalar(desc)}\nalwaysApply: false\n---\n\n${body}`;
  if (ide === 'windsurf') return `---\ntrigger: model_decision\ndescription: ${scalar(desc)}\n---\n\n${body}`;
  return `---\ndescription: ${scalar(desc)}\n---\n\n${body}`;
}
export function exportSkills(root, { ide, global: isGlobal = false, home = os.homedir(), record = true } = {}) {
  if (!ide) throw new Error(`Usage: skills export --ide <${IDES.join('|')}|all> [--global]`);
  const ides = ide === 'all' ? IDES : [ide];
  const manifest = readManifest(root);
  const active = manifest.skills.filter(s => s.enabled);
  const results = [];
  for (const target of ides) {
    const t = exportTargets(root, target, isGlobal, home);
    let written = 0, unchanged = 0, removed = 0; const conflicts = [];
    const wanted = new Set();
    for (const skill of active) {
      const file = t.file(skill.name); wanted.add(path.resolve(file));
      const text = exportText(target, skill, isGlobal ? path.join(root, ...skill.path.split('/')) : skill.path, root, isGlobal);
      if (isFile(file)) {
        const current = fs.readFileSync(file, 'utf8');
        if (!current.includes(EXPORT_MARKER)) { conflicts.push(file); continue; }
        if (current === text) { unchanged++; continue; }
      }
      writeFile(file, text); written++;
    }
    if (isDir(t.dir)) for (const e of fs.readdirSync(t.dir, { withFileTypes: true })) {
      if (!e.name.startsWith('jh-') || e.isSymbolicLink()) continue;
      const file = target === 'claude' ? path.join(t.dir, e.name, 'SKILL.md') : path.join(t.dir, e.name);
      if (wanted.has(path.resolve(file)) || !isFile(file) || !fs.readFileSync(file, 'utf8').includes(EXPORT_MARKER)) continue;
      fs.unlinkSync(file); removed++;
      if (target === 'claude') { try { fs.rmdirSync(path.join(t.dir, e.name)); } catch { /* keep non-empty owner folders */ } }
    }
    results.push({ ide: target, dir: t.dir, written, unchanged, removed, conflicts });
  }
  if (record) {
    const stateFile = path.join(root, EXPORTS_STATE);
    let state = []; try { state = JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { state = []; }
    if (!Array.isArray(state)) state = [];
    for (const target of ides) if (!state.some(s => s.ide === target && s.global === isGlobal)) state.push({ ide: target, global: isGlobal });
    writeFile(stateFile, JSON.stringify(state, null, 2) + '\n');
  }
  return results;
}
function reExport(root, home) {
  let state = []; try { state = JSON.parse(fs.readFileSync(path.join(root, EXPORTS_STATE), 'utf8')); } catch { return []; }
  if (!Array.isArray(state)) return [];
  return state.filter(s => IDES.includes(s.ide)).flatMap(s => exportSkills(root, { ide: s.ide, global: Boolean(s.global), home, record: false }));
}

// ---------- list ----------
export function formatList(manifest) {
  const rows = manifest.skills.map(s => [s.name, s.version, s.category, s.requires_mcp.join(','), s.triggers.slice(0, 2).join(' · ') + (s.triggers.length > 2 ? ' …' : ''), s.trust === 'community' ? (s.enabled ? 'enabled' : 'disabled (review)') : 'core']);
  const head = ['NAME', 'VERSION', 'CATEGORY', 'MCP', 'TRIGGERS', 'STATUS'];
  const width = head.map((h, i) => Math.min(i === 4 ? 56 : 40, Math.max(h.length, ...rows.map(r => r[i].length))));
  const fit = (v, w) => (v.length > w ? v.slice(0, w - 1) + '…' : v.padEnd(w));
  return [head, width.map(w => '-'.repeat(w)), ...rows].map(r => r.map((v, i) => fit(v, width[i])).join('  ').trimEnd()).join('\n') + `\n\n${rows.length} skills (${rows.filter(r => r[5] === 'core').length} core, ${rows.filter(r => r[5] !== 'core').length} community).`;
}
