// Fast Direct ATS JSON Feed Harvester (Greenhouse, Lever, Ashby).
// Zero-dependency Node built-ins only; read-only GET requests to allowlisted public ATS JSON endpoints.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { decodeEntities } from './cv-tools.mjs';

export const ATS_PROVIDERS = new Set(['greenhouse', 'lever', 'ashby']);
const TOKEN_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;

function unquoteYaml(raw) {
  const v = raw.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v.replace(/\s+#.*$/, '').trim();
}

function parseInlineList(raw) {
  const m = /^\[(.*)\]$/.exec(raw.trim());
  if (!m) return null;
  if (!m[1].trim()) return [];
  return m[1].split(',').map(x => unquoteYaml(x)).filter(Boolean);
}

/** Extract targets and board_tokens from targets.yaml without third-party YAML deps. */
export function parseTargetsYaml(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const targets = [];
  let current = null;
  let activeListKey = null;

  for (const line of lines) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const itemStart = /^\s{2}-\s+([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (itemStart) {
      current = {};
      targets.push(current);
      activeListKey = null;
      const [, k, v] = itemStart;
      if (v.trim()) current[k] = unquoteYaml(v);
      continue;
    }
    if (!current) continue;
    const listItem = /^\s{6,}-\s+(.+)$/.exec(line);
    if (listItem && activeListKey) {
      if (!Array.isArray(current[activeListKey])) current[activeListKey] = [];
      current[activeListKey].push(unquoteYaml(listItem[1]));
      continue;
    }
    const prop = /^\s{4}([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (prop) {
      const [, k, rest] = prop;
      const inline = parseInlineList(rest);
      if (inline !== null) {
        current[k] = inline;
        activeListKey = null;
      } else if (!rest.trim() || /^#/.test(rest.trim())) {
        current[k] = [];
        activeListKey = k;
      } else {
        const val = unquoteYaml(rest);
        current[k] = val === 'true' ? true : val === 'false' ? false : /^\d+$/.test(val) ? Number(val) : val;
        activeListKey = null;
      }
    }
  }
  return targets;
}

/** Extract roles and locations from preferences.yaml without third-party YAML deps. */
export function parsePreferencesYaml(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const out = { roles: [], locations: [] };
  let active = null;
  for (const line of lines) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const top = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (top) {
      const [, k, rest] = top;
      if (k === 'roles' || k === 'locations') {
        const inline = parseInlineList(rest);
        if (inline !== null) { out[k] = inline; active = null; }
        else active = k;
      } else {
        active = null;
      }
      continue;
    }
    const item = /^\s+-\s+(.+)$/.exec(line);
    if (item && active) out[active].push(unquoteYaml(item[1]));
  }
  return out;
}

function tokenFromUrl(platform, urlStr) {
  if (!urlStr) return null;
  try {
    const u = new URL(urlStr);
    const segs = u.pathname.split('/').filter(Boolean);
    if (!segs.length) return null;
    if (platform === 'greenhouse' && /^(?:boards|job-boards)\.greenhouse\.io$/i.test(u.hostname)) return TOKEN_RE.test(segs[0]) ? segs[0] : null;
    if (platform === 'lever' && /^jobs\.lever\.co$/i.test(u.hostname)) return TOKEN_RE.test(segs[0]) ? segs[0] : null;
    if (platform === 'ashby' && /^jobs\.ashbyhq\.com$/i.test(u.hostname)) return TOKEN_RE.test(segs[0]) ? segs[0] : null;
  } catch { /* ignore */ }
  return null;
}

export function collectConfiguredBoards(targets, { includeDisabled = false } = {}) {
  const boards = [];
  const seen = new Set();
  for (const t of targets) {
    if (!ATS_PROVIDERS.has(t.platform)) continue;
    if (!includeDisabled && t.enabled !== true) continue;
    const tokens = [];
    if (typeof t.board_token === 'string' && t.board_token.trim()) tokens.push(t.board_token.trim());
    if (Array.isArray(t.board_tokens)) for (const tok of t.board_tokens) if (typeof tok === 'string' && tok.trim()) tokens.push(tok.trim());
    if (!tokens.length) {
      const derived = tokenFromUrl(t.platform, t.url);
      if (derived) tokens.push(derived);
    }
    for (const token of tokens) {
      if (!TOKEN_RE.test(token)) continue;
      const key = `${t.platform}:${token}`;
      if (seen.has(key)) continue;
      seen.add(key);
      boards.push({ platform: t.platform, token, maxResults: Number(t.max_results) || 25 });
    }
  }
  return boards;
}

export function atsEndpoint(platform, token) {
  if (!ATS_PROVIDERS.has(platform)) throw new Error(`Unsupported ATS provider: ${platform}`);
  if (!TOKEN_RE.test(token)) throw new Error(`Invalid board token "${token}" for ${platform}`);
  const enc = encodeURIComponent(token);
  if (platform === 'greenhouse') return `https://boards-api.greenhouse.io/v1/boards/${enc}/jobs?content=true`;
  if (platform === 'lever') return `https://api.lever.co/v0/postings/${enc}?mode=json`;
  return `https://api.ashbyhq.com/posting-api/job-board/${enc}`;
}

function stripHtml(html) {
  return decodeEntities(String(html ?? '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeAtsJobs(platform, token, payload, nowIso = new Date().toISOString()) {
  if (platform === 'greenhouse') {
    const list = Array.isArray(payload?.jobs) ? payload.jobs : [];
    return list.map(j => ({
      job_id: `greenhouse:${token}-${j.id}`,
      title: String(j.title ?? '').trim(),
      company: token,
      platform: 'greenhouse',
      url: String(j.absolute_url ?? '').trim(),
      location: String(j.location?.name ?? '').trim(),
      apply_type: 'external',
      posted_at: j.updated_at ? new Date(j.updated_at).toISOString() : null,
      discovered_at: nowIso,
      description_text: stripHtml(j.content),
    })).filter(j => j.title && j.url);
  }
  if (platform === 'lever') {
    const list = Array.isArray(payload) ? payload : [];
    return list.map(j => ({
      job_id: `lever:${token}-${j.id}`,
      title: String(j.text ?? '').trim(),
      company: token,
      platform: 'lever',
      url: String(j.hostedUrl ?? j.applyUrl ?? '').trim(),
      location: String(j.categories?.location ?? '').trim(),
      apply_type: 'external',
      posted_at: typeof j.createdAt === 'number' ? new Date(j.createdAt).toISOString() : null,
      discovered_at: nowIso,
      description_text: String(j.descriptionPlain ?? stripHtml(j.description)).trim(),
    })).filter(j => j.title && j.url);
  }
  // ashby
  const list = Array.isArray(payload?.jobs) ? payload.jobs : [];
  return list.map(j => ({
    job_id: `ashby:${token}-${j.id}`,
    title: String(j.title ?? '').trim(),
    company: token,
    platform: 'ashby',
    url: String(j.jobUrl ?? j.applyUrl ?? '').trim(),
    location: [j.location, j.isRemote ? 'Remote' : ''].filter(Boolean).join(' · '),
    apply_type: 'external',
    posted_at: j.publishedAt ? new Date(j.publishedAt).toISOString() : null,
    discovered_at: nowIso,
    description_text: String(j.descriptionPlain ?? stripHtml(j.descriptionHtml)).trim(),
  })).filter(j => j.title && j.url);
}

export function filterHarvestedJobs(jobs, { roles = [], locations = [] } = {}) {
  const roleTerms = roles.map(r => r.trim().toLowerCase()).filter(Boolean);
  const locTerms = locations.map(l => l.trim().toLowerCase()).filter(Boolean);
  return jobs.filter(j => {
    const titleAndDesc = `${j.title} ${j.description_text}`.toLowerCase();
    const roleOk = !roleTerms.length || roleTerms.some(term => {
      if (titleAndDesc.includes(term)) return true;
      const words = term.split(/\s+/).filter(w => w.length > 2);
      return words.length > 0 && words.every(w => j.title.toLowerCase().includes(w));
    });
    const locOk = !locTerms.length || locTerms.some(l => j.location.toLowerCase().includes(l));
    return roleOk && locOk;
  });
}

function writeAtomic(file, text) {
  let cursor = path.resolve(file);
  while (true) {
    let stat;
    try { stat = fs.lstatSync(cursor); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (stat?.isSymbolicLink()) throw new Error(`Refusing to write through a symbolic link (${cursor}).`);
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const temp = `${file}.ats-${process.pid}-${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(temp, text, { flag: 'wx', mode: 0o600 });
  try { fs.renameSync(temp, file); } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
}

export async function pullAts(root, {
  boards = [],
  roles = [],
  locations = [],
  limit = 50,
  includeDisabled = false,
  outFile = null,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch() is required (Node.js 18+).');

  const targetsFile = path.join(root, 'context', 'targets.yaml');
  const prefsFile = path.join(root, 'context', 'preferences.yaml');

  let resolvedBoards = [...boards];
  if (!resolvedBoards.length && fs.existsSync(targetsFile)) {
    const parsed = parseTargetsYaml(fs.readFileSync(targetsFile, 'utf8'));
    resolvedBoards = collectConfiguredBoards(parsed, { includeDisabled });
  }
  if (!resolvedBoards.length) {
    throw new Error('No ATS boards configured. Pass --board greenhouse:<token> (or lever:<token> / ashby:<token>) or add board_tokens in context/targets.yaml.');
  }

  let effectiveRoles = [...roles];
  let effectiveLocations = [...locations];
  if (!effectiveRoles.length && fs.existsSync(prefsFile)) {
    const prefs = parsePreferencesYaml(fs.readFileSync(prefsFile, 'utf8'));
    effectiveRoles = prefs.roles;
    if (!effectiveLocations.length) effectiveLocations = prefs.locations;
  }

  const nowIso = new Date().toISOString();
  const harvested = [];
  const errors = [];
  const seenIds = new Set();

  for (const b of resolvedBoards) {
    const endpoint = atsEndpoint(b.platform, b.token);
    try {
      const res = await fetchImpl(endpoint, { headers: { Accept: 'application/json', 'User-Agent': 'job-hunter-os-ats-harvester/1.0' } });
      if (!res.ok) {
        errors.push(`${b.platform}:${b.token} returned HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const normalized = normalizeAtsJobs(b.platform, b.token, data, nowIso);
      const matched = filterHarvestedJobs(normalized, { roles: effectiveRoles, locations: effectiveLocations });
      for (const job of matched.slice(0, b.maxResults || limit)) {
        if (seenIds.has(job.job_id)) continue;
        seenIds.add(job.job_id);
        const { description_text, ...rest } = job;
        harvested.push({ ...rest, description_preview: description_text.slice(0, 280) });
        if (harvested.length >= limit) break;
      }
    } catch (err) {
      errors.push(`${b.platform}:${b.token} failed: ${err instanceof Error ? err.message : 'fetch error'}`);
    }
    if (harvested.length >= limit) break;
  }

  const dest = outFile ? path.resolve(process.cwd(), outFile) : path.join(root, 'logs', 'ats-harvest.json');
  const payload = {
    harvested_at: nowIso,
    boards: resolvedBoards.map(b => `${b.platform}:${b.token}`),
    roles_filter: effectiveRoles,
    locations_filter: effectiveLocations,
    count: harvested.length,
    errors,
    jobs: harvested,
  };
  writeAtomic(dest, JSON.stringify(payload, null, 2) + '\n');
  return { ...payload, output_file: dest };
}

export function formatHarvestTable(result) {
  if (!result.jobs.length) return `0 matching jobs harvested from ${result.boards.join(', ')} (saved ${result.output_file}).`;
  const rows = result.jobs.map((j, idx) => [String(idx + 1), j.platform, j.company, j.title, j.location || 'Unspecified', j.url]);
  const head = ['#', 'ATS', 'BOARD', 'TITLE', 'LOCATION', 'URL'];
  const max = [3, 12, 18, 36, 22, 60];
  const width = head.map((h, i) => Math.min(max[i], Math.max(h.length, ...rows.map(r => r[i].length))));
  const fit = (v, w) => (v.length > w ? v.slice(0, w - 1) + '…' : v.padEnd(w));
  return [head, width.map(w => '-'.repeat(w)), ...rows]
    .map(r => r.map((v, i) => fit(v, width[i])).join('  ').trimEnd())
    .join('\n') + `\n\n${result.jobs.length} matching jobs written to ${result.output_file}.`;
}
