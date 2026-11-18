import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { matchesContract } from './json-contract.mjs';
const contract = JSON.parse(fs.readFileSync(new URL('../schemas/readiness.schema.json', import.meta.url), 'utf8'));
export const gateKeys = ['resume_gate','target_preferences_gate','compensation_and_legal_gate','tech_experience_matrix_gate','browser_and_platforms_gate'];
export const placeholderPattern = /\b(?:Jane Doe|John Doe|YOUR_NAME|YOUR_EMAIL|your-handle|your-site|replace-with|Acme Fintech|Nile Commerce)\b|(?:example@email\.com|example\.com|example\.invalid|reda@example\.com)/i;
export function sourceHash(buffer) { return createHash('sha256').update(buffer).digest('hex'); }
export function auditReadiness(root, data = {}, now = new Date()) {
  const issues = Object.fromEntries(gateKeys.map(key => [key, []]));
  const add = (key, message) => issues[key].push(message);
  let state;
  try { state = JSON.parse(fs.readFileSync(path.join(root,'context/readiness-state.json'),'utf8')); } catch { state = null; }
  const read = file => { try { const absolute = path.join(root,file); if (fs.lstatSync(absolute).isSymbolicLink()) return ''; return fs.readFileSync(absolute,'utf8'); } catch { return ''; } };
  const files = {'context/profile.md':'resume_gate','context/cv.md':'resume_gate','context/preferences.yaml':'target_preferences_gate','context/form-answers.yaml':'compensation_and_legal_gate','context/targets.yaml':'browser_and_platforms_gate'};
  if (!matchesContract(state, contract)) {
    for (const key of gateKeys) add(key,'Missing or invalid readiness-state.json; start the structured interview');
  }
  for (const [file,key] of Object.entries(files)) {
    const text = read(file);
    if (!text.trim()) add(key,`Missing ${file}`);
    else if (placeholderPattern.test(text) || (read(file+'.example') && text === read(file+'.example'))) add(key,`Placeholder/example values in ${file}; owner must supply real answers`);
    if (text && state?.source_hashes?.[file] !== sourceHash(Buffer.from(text))) add(key,`Changed/unverified ${file}; reconfirm evidence`);
  }
  for (const key of gateKeys) {
    const g = state?.gates?.[key];
    if (g?.complete !== true || g?.owner_confirmed !== true || !g?.verified_at || !Number.isFinite(Date.parse(g.verified_at)) || Date.parse(g.verified_at) > now.getTime() || !Array.isArray(g?.missing) || g.missing.length) add(key,'Gate lacks explicit owner confirmation or verified evidence');
  }
  let pdf;
  for (const file of ['assets/resume.pdf','context/resume.pdf']) {
    try { const full = path.join(root,file); if (fs.lstatSync(full).isSymbolicLink()) continue; const b = fs.readFileSync(full); if (b.subarray(0,5).toString() === '%PDF-') { pdf = file; if (state?.source_hashes?.[file] !== sourceHash(b)) add('resume_gate','PDF changed/unverified; inspect content and confirm'); break; } } catch { /* missing PDF */ }
  }
  if (!pdf) add('resume_gate','Missing real PDF at assets/resume.pdf or context/resume.pdf');
  const r = state?.requirements || {};
  const list = value => Array.isArray(value) && value.length > 0 && value.every(x => typeof x === 'string' && x.trim() && !placeholderPattern.test(x));
  for (const field of ['roles','seniority','work_modes','regions','timezones']) if (!list(r[field])) add('target_preferences_gate',`Confirm ${field}`);
  if (!Array.isArray(r.blacklisted_companies) || !r.blacklisted_companies.every(x=>typeof x==='string' && x.trim())) add('target_preferences_gate','Confirm blacklisted_companies (explicit [] is allowed)');
  if (!Array.isArray(r.work_modes) || !r.work_modes.every(x=>['Remote','Hybrid','Onsite'].includes(x))) add('target_preferences_gate','Confirm work modes: Remote/Hybrid/Onsite');
  if (!r.salary || typeof r.salary.minimum !== 'number' || !Number.isFinite(r.salary.minimum) || r.salary.minimum < 0 || !/^[A-Z]{3}$/.test(r.salary.currency || '') || !['hourly','monthly','annual'].includes(r.salary.period)) add('compensation_and_legal_gate','Confirm minimum salary, currency and hourly/monthly/annual period');
  for (const field of ['notice_period','earliest_start_date','work_authorization','visa_sponsorship']) if (typeof r[field] !== 'string' || !r[field].trim() || placeholderPattern.test(r[field])) add('compensation_and_legal_gate',`Confirm ${field}`);
  const startDate = Date.parse(r.earliest_start_date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.earliest_start_date || '') || !Number.isFinite(startDate) || new Date(startDate).toISOString().slice(0,10) !== r.earliest_start_date) add('compensation_and_legal_gate','Confirm earliest_start_date as a calendar date');
  const answersText = read('context/form-answers.yaml');
  if (!/^owner_verified:\s*true\s*(?:#.*)?$/m.test(answersText)) add('compensation_and_legal_gate','Owner must verify factual/legal ATS answers');
  if (!list(r.core_skills)) add('tech_experience_matrix_gate','Confirm core technologies and exact hands-on years');
  // Production preflight supplies parsed YAML. CLI uses conservative block-map extraction only.
  let years = data.answers?.skills_years;
  if (!years) {
    years = {};
    const block = answersText.match(/^skills_years:\s*\n((?:[ \t]+[^\n]*\n?)*)/m)?.[1] || '';
    for (const line of block.split('\n')) { const match = line.match(/^\s+([\w.+# -]+):\s*(\d+(?:\.\d+)?)\s*(?:#.*)?$/); if (match) years[match[1].trim()] = Number(match[2]); }
  }
  for (const skill of Array.isArray(r.core_skills) ? r.core_skills : []) if (typeof years[skill] !== 'number' || !Number.isFinite(years[skill]) || years[skill] < 0) add('tech_experience_matrix_gate',`Confirm exact hands-on years for ${skill}`);
  const targetsText = read('context/targets.yaml');
  let targets = data.targets?.targets;
  if (!targets) targets = targetsText.split(/^\s*- name:/m).slice(1).map(block=>({enabled:/^\s+enabled:\s*true\s*$/m.test(block),platform:block.match(/^\s+platform:\s*([a-z]+)\s*$/m)?.[1],auth_required:!/^\s+auth_required:\s*false\s*$/m.test(block)}));
  const enabled = targets.filter(t=>t.enabled);
  if (!enabled.length) add('browser_and_platforms_gate','Select and confirm at least one enabled job platform');
  for (const target of enabled) {
    const session = Array.isArray(state?.sessions) ? state.sessions.find(s=>s?.platform===target.platform) : undefined;
    const at = Date.parse(session?.verified_at || '');
    if (!session || !Number.isFinite(at) || at > now.getTime() || now.getTime()-at > 86400000 || typeof session.evidence !== 'string' || !session.evidence.trim() || (target.auth_required !== false && session.authenticated !== true)) add('browser_and_platforms_gate',`Verify ${target.platform || 'selected platform'} session/access in headed setup (evidence valid for 24h; recheck during run)`);
  }
  if (!state?.updated_at || !Number.isFinite(Date.parse(state.updated_at)) || Date.parse(state.updated_at)>now.getTime()) add('resume_gate','Missing valid state update timestamp');
  const gates = Object.fromEntries(gateKeys.map(key=>[key,{complete:issues[key].length===0,missing:[...new Set(issues[key])]}]));
  const overall_ready = gateKeys.every(key=>gates[key].complete) && state?.overall_ready === true && state?.status === 'READY_100%';
  return { overall_ready, status: overall_ready ? 'READY_100%' : 'INCOMPLETE', gates, state, pdf };
}
