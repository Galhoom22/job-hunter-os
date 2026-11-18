// Zero-dependency Anti-Hallucination CV Fact-Checker & AI-Slop detector.
// Compares numbers, metrics, dates, employers, institutions, projects and skills
// in a tailored resume (.json, .html, .md, .txt) against verified owner sources.
import fs from 'node:fs';
import path from 'node:path';
import { htmlToBlocks, decodeEntities } from './cv-tools.mjs';

export const BANNED_AI_SLOP = [
  'delve',
  'testament',
  'tapestry',
  'spearheaded',
  'synergy',
  'thrilled to apply',
  'fast-paced environment',
  'moreover',
  'furthermore',
  'leveraged',
  'orchestrated',
  'passionate about',
  'dynamic environment',
  'proven track record',
  'hit the ground running',
];

function regularRead(file, maxBytes = 5 * 1024 * 1024) {
  let stat;
  try { stat = fs.lstatSync(file); } catch { throw new Error(`File not found: ${file}`); }
  if (!stat.isFile()) throw new Error(`Refusing non-regular file (symlinks/directories blocked): ${file}`);
  if (stat.size > maxBytes) throw new Error(`File exceeds 5 MB limit: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function norm(s) {
  return String(s ?? '').normalize('NFKD').toLowerCase().replace(/\s+/g, ' ').trim();
}

function extractMetrics(text) {
  // Strip URLs, emails, and phone-like strings before scanning for numeric claims.
  const cleaned = String(text ?? '')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, ' ')
    .replace(/\+\d[\d\s()-]{6,}\d/g, ' ');

  const tokens = [];
  // Currency/multiplier/percent/number tokens
  const re = /(?:[$€£¥]\s*\d+(?:[.,]\d+)?(?:\s*[kmbKMB])?\+?|\d+(?:[.,]\d+)?\s*%|\b\d+(?:[.,]\d+)?\s*[xX]\b|\b\d+(?:[.,]\d+)?\+?)/g;
  for (const m of cleaned.matchAll(re)) {
    const raw = m[0].trim();
    const canonical = raw.toLowerCase().replace(/,/g, '').replace(/\s+/g, '');
    const numeric = canonical.replace(/^[$€£¥]/, '').replace(/(?:%|[kmbx+])$/i, '');
    tokens.push({ raw, canonical, numeric });
  }
  return tokens;
}

function collectVerifiedCorpus(root, opts = {}) {
  const sources = [];
  const resumeDataFile = opts.resumeDataPath ? path.resolve(process.cwd(), opts.resumeDataPath) : path.join(root, 'context', 'resume-data.json');
  const profileFile = opts.profilePath ? path.resolve(process.cwd(), opts.profilePath) : path.join(root, 'context', 'profile.md');
  const cvFile = opts.cvPath ? path.resolve(process.cwd(), opts.cvPath) : path.join(root, 'context', 'cv.md');

  let resumeData = null;
  if (fs.existsSync(resumeDataFile)) {
    resumeData = JSON.parse(regularRead(resumeDataFile));
    sources.push(path.relative(root, resumeDataFile) || resumeDataFile);
  }
  const texts = [];
  for (const f of [profileFile, cvFile]) {
    if (fs.existsSync(f)) {
      texts.push(regularRead(f));
      sources.push(path.relative(root, f) || f);
    }
  }

  if (resumeData) {
    const parts = [
      resumeData.first_name, resumeData.last_name, resumeData.full_name, resumeData.headline, resumeData.summary,
      resumeData.city, resumeData.country,
      ...(resumeData.work_history || []).flatMap(w => [w.employer, w.title, w.location, w.start_date, w.end_date, ...(w.bullets || [])]),
      ...(resumeData.education || []).flatMap(e => [e.institution, e.degree, e.field_of_study, e.start_date, e.end_date]),
      ...(resumeData.projects || []).flatMap(p => [p.name, ...(p.bullets || [])]),
      ...(resumeData.languages || []).map(l => typeof l === 'string' ? l : `${l.language || ''} ${l.level || ''}`),
      ...(resumeData.certifications || []).map(c => typeof c === 'string' ? c : `${c.name || ''} ${c.issuer || ''} ${c.date || ''}`),
      ...Object.entries(resumeData.skills_with_years || {}).flatMap(([k, v]) => [k, `${v}`, `${v} years`]),
    ];
    texts.push(parts.filter(Boolean).join('\n'));
  }

  const combined = texts.join('\n');
  const metricTokens = extractMetrics(combined);
  const canonicalSet = new Set(metricTokens.map(t => t.canonical));
  const numericSet = new Set(metricTokens.map(t => t.numeric));

  // Extract YYYY parts from YYYY-MM dates as valid standalone year numbers.
  if (resumeData) {
    for (const w of resumeData.work_history || []) {
      for (const d of [w.start_date, w.end_date]) {
        if (typeof d === 'string') {
          const y = d.split('-')[0];
          if (/^\d{4}$/.test(y)) { canonicalSet.add(y); numericSet.add(y); }
        }
      }
    }
    for (const e of resumeData.education || []) {
      for (const d of [e.start_date, e.end_date]) {
        if (typeof d === 'string') {
          const y = d.split('-')[0];
          if (/^\d{4}$/.test(y)) { canonicalSet.add(y); numericSet.add(y); }
        }
      }
    }
  }

  return { sources, resumeData, combinedNorm: norm(combined), canonicalSet, numericSet };
}

export function findAiSlop(text) {
  const lower = String(text ?? '').toLowerCase();
  const hits = [];
  for (const phrase of BANNED_AI_SLOP) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(lower)) hits.push(phrase);
  }
  const emDashes = (String(text ?? '').match(/—/g) || []).length;
  return { banned_phrases: hits, em_dash_count: emDashes };
}

function isMetricVerified(token, corpus) {
  if (corpus.canonicalSet.has(token.canonical)) return true;
  // Allow an exact plain number (no %, $, x, +, k/m/b) if its numeric value exists in verified corpus.
  const isDecorated = /^[$€£¥]|[%kmbx+]$/i.test(token.canonical);
  if (!isDecorated && corpus.numericSet.has(token.numeric)) return true;
  return false;
}

function checkHeadingsAndEntities(blocks, corpus, errors) {
  // In rendered HTML/text resumes, h3 headings follow "Title — Employer" or "Degree — Institution" or "Project — url".
  const verifiedOrgs = new Set();
  if (corpus.resumeData) {
    for (const w of corpus.resumeData.work_history || []) if (w.employer) verifiedOrgs.add(norm(w.employer));
    for (const e of corpus.resumeData.education || []) if (e.institution) verifiedOrgs.add(norm(e.institution));
    for (const p of corpus.resumeData.projects || []) if (p.name) verifiedOrgs.add(norm(p.name));
  }
  for (const b of blocks) {
    if (b.type !== 'h3') continue;
    const parts = b.text.split(/\s+[—–-]\s+/).map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const entity = parts[parts.length - 1];
      if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(entity)) continue; // URL suffix on project
      const eNorm = norm(entity);
      const known = verifiedOrgs.has(eNorm) || corpus.combinedNorm.includes(eNorm);
      if (!known) errors.push(`Unverified employer/institution/project entity: "${entity}"`);
    }
  }
}

export function verifyTailoredCv(root, tailoredFile, opts = {}) {
  const corpus = collectVerifiedCorpus(root, opts);
  if (!corpus.sources.length) {
    return {
      ok: false,
      missingBaseline: true,
      errors: ['Verified baseline missing: create context/resume-data.json, context/profile.md, or context/cv.md first.'],
      warnings: [],
      sources: [],
    };
  }

  const file = path.resolve(process.cwd(), tailoredFile);
  const raw = regularRead(file);
  const ext = path.extname(file).toLowerCase();
  const errors = [];
  const warnings = [];
  let textToScan = '';
  let proseForSlop = '';

  if (ext === '.json') {
    let data;
    try { data = JSON.parse(raw); } catch {
      return { ok: false, missingBaseline: false, errors: [`Invalid JSON in ${tailoredFile}`], warnings: [], sources: corpus.sources };
    }
    if (data.document === 'cover_letter') {
      proseForSlop = (data.paragraphs || []).join('\n');
      textToScan = proseForSlop;
    } else {
      if (data.owner_verified !== true) errors.push('Tailored payload must have owner_verified: true.');
      if (corpus.resumeData) {
        const vEmployers = new Set((corpus.resumeData.work_history || []).map(w => norm(w.employer)));
        const vInstitutions = new Set((corpus.resumeData.education || []).map(e => norm(e.institution)));
        const vDegrees = new Set((corpus.resumeData.education || []).map(e => norm(e.degree)));
        const vProjects = new Set((corpus.resumeData.projects || []).map(p => norm(p.name)));
        const vSkills = new Set(Object.keys(corpus.resumeData.skills_with_years || {}).map(norm));

        for (const [i, w] of (data.work_history || []).entries()) {
          if (!vEmployers.has(norm(w.employer))) {
            errors.push(`work_history[${i}].employer "${w.employer}" not found in verified resume-data.json`);
          } else {
            const match = (corpus.resumeData.work_history || []).find(vw => norm(vw.employer) === norm(w.employer) && norm(vw.title) === norm(w.title))
              || (corpus.resumeData.work_history || []).find(vw => norm(vw.employer) === norm(w.employer));
            if (match && (w.start_date !== match.start_date || w.end_date !== match.end_date)) {
              errors.push(`work_history[${i}] dates (${w.start_date}..${w.end_date ?? 'Present'}) do not match verified dates for "${w.employer}"`);
            }
          }
        }
        for (const [i, e] of (data.education || []).entries()) {
          if (!vInstitutions.has(norm(e.institution))) errors.push(`education[${i}].institution "${e.institution}" not found in verified resume-data.json`);
          if (e.degree && vDegrees.size && !vDegrees.has(norm(e.degree))) errors.push(`education[${i}].degree "${e.degree}" not found in verified resume-data.json`);
        }
        for (const [i, p] of (data.projects || []).entries()) {
          if (!vProjects.has(norm(p.name)) && !corpus.combinedNorm.includes(norm(p.name))) {
            errors.push(`projects[${i}].name "${p.name}" not found in verified context`);
          }
        }
        for (const s of data.skills_order || []) {
          if (!vSkills.has(norm(s)) && !corpus.combinedNorm.includes(norm(s))) errors.push(`Unverified skill in skills_order: "${s}"`);
        }
        for (const s of Object.keys(data.skills_with_years || {})) {
          if (!vSkills.has(norm(s)) && !corpus.combinedNorm.includes(norm(s))) errors.push(`Unverified skill in skills_with_years: "${s}"`);
        }
      }
      const bullets = [
        data.summary || '',
        ...(data.work_history || []).flatMap(w => w.bullets || []),
        ...(data.projects || []).flatMap(p => p.bullets || []),
      ];
      proseForSlop = bullets.join('\n');
      textToScan = [
        proseForSlop,
        ...Object.entries(data.skills_with_years || {}).map(([k, v]) => `${k} ${v}`),
      ].join('\n');
    }
  } else if (ext === '.html' || ext === '.htm') {
    const blocks = htmlToBlocks(raw);
    checkHeadingsAndEntities(blocks, corpus, errors);
    const bodyBlocks = blocks.filter(b => b.type !== 'h1');
    textToScan = bodyBlocks.map(b => b.text).join('\n');
    proseForSlop = bodyBlocks.filter(b => b.type !== 'h3').map(b => b.text).join('\n');
  } else {
    const plain = decodeEntities(raw);
    const lines = plain.split(/\r?\n/);
    const headingBlocks = [];
    for (const line of lines) {
      const m = /^###\s+(.+)$/.exec(line.trim());
      if (m) headingBlocks.push({ type: 'h3', text: m[1] });
    }
    checkHeadingsAndEntities(headingBlocks, corpus, errors);
    textToScan = plain;
    proseForSlop = plain;
  }

  // Scan numeric/metric claims
  const seenBad = new Set();
  for (const tok of extractMetrics(textToScan)) {
    if (!isMetricVerified(tok, corpus) && !seenBad.has(tok.raw)) {
      seenBad.add(tok.raw);
      errors.push(`Unverified numeric/metric claim: "${tok.raw}" (not found in ${corpus.sources.join(', ')})`);
    }
  }

  // AI-slop / humanizer check
  const slop = findAiSlop(proseForSlop);
  if (slop.banned_phrases.length) {
    const msg = `AI-slop phrasing detected (${slop.banned_phrases.join(', ')}); rewrite per skills/humanize-writing.md`;
    if (opts.strictHumanize) errors.push(msg);
    else warnings.push(msg);
  }
  if (slop.em_dash_count > 1) {
    const msg = `Em-dash overuse (${slop.em_dash_count} "—" found in prose); replace with commas or periods per skills/humanize-writing.md`;
    if (opts.strictHumanize) errors.push(msg);
    else warnings.push(msg);
  }

  return {
    ok: errors.length === 0,
    missingBaseline: false,
    errors,
    warnings,
    sources: corpus.sources,
  };
}
