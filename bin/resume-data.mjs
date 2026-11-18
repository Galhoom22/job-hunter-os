// Zero-dependency validator mirroring schemas/resume-data.schema.json (shared by CLI, tests and agents).
export const RESUME_DATA_REQUIRED = ['owner_verified', 'first_name', 'last_name', 'email', 'phone_country_code', 'phone_national', 'city_autocomplete', 'linkedin_url', 'github_url', 'portfolio_url', 'work_history', 'education', 'skills_with_years'];
const PLACEHOLDER = /example\.(?:com|org)|replace-with|your-handle|your-site|lorem ipsum|\{\{/i;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const YEAR_OR_MONTH = /^\d{4}(-(0[1-9]|1[0-2]))?$/;
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const nonEmpty = v => typeof v === 'string' && v.trim().length > 0;
function https(value, host) {
  if (value === '') return true;
  try { const u = new URL(value); return u.protocol === 'https:' && (!host || host.test(u.hostname)); } catch { return false; }
}
/** Returns a list of problems; empty means structurally valid (and verified when requireVerified). */
export function checkResumeData(d, { requireVerified = false } = {}) {
  if (!isObj(d)) return ['resume data must be a JSON object'];
  const errors = [];
  for (const key of RESUME_DATA_REQUIRED) if (!(key in d)) errors.push(`missing ${key}`);
  if (typeof d.owner_verified !== 'boolean') errors.push('owner_verified must be true or false');
  if (requireVerified && d.owner_verified !== true) errors.push('owner_verified must be true (owner-confirmed) before agents use or render it');
  for (const key of ['first_name', 'last_name']) if (key in d && !nonEmpty(d[key])) errors.push(`${key} must be a non-empty string`);
  if ('email' in d && !(typeof d.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))) errors.push('email is invalid');
  if ('phone_country_code' in d && !(typeof d.phone_country_code === 'string' && /^\+[1-9]\d{0,3}$/.test(d.phone_country_code))) errors.push('phone_country_code must look like +20 or +1');
  if ('phone_national' in d) {
    const digits = typeof d.phone_national === 'string' ? d.phone_national.replace(/\D/g, '') : '';
    if (!(typeof d.phone_national === 'string' && /^[0-9][0-9 ()-]*$/.test(d.phone_national) && digits.length >= 4 && digits.length <= 14)) errors.push('phone_national must be the local number without country code');
  }
  if ('city_autocomplete' in d && !(nonEmpty(d.city_autocomplete) && d.city_autocomplete.length <= 80)) errors.push('city_autocomplete must be the short text to type into location fields');
  for (const [key, host] of [['linkedin_url', /(^|\.)linkedin\.com$/], ['github_url', /^github\.com$/], ['portfolio_url', null]]) if (key in d && !(typeof d[key] === 'string' && https(d[key], host))) errors.push(`${key} must be an https URL${host ? ' on the right site' : ''} or empty`);
  if ('work_history' in d) {
    if (!Array.isArray(d.work_history)) errors.push('work_history must be an array');
    else d.work_history.forEach((w, i) => {
      if (!isObj(w)) return errors.push(`work_history[${i}] must be an object`);
      if (!nonEmpty(w.employer) || !nonEmpty(w.title)) errors.push(`work_history[${i}] needs employer and title`);
      if (!MONTH.test(w.start_date ?? '')) errors.push(`work_history[${i}].start_date must be YYYY-MM`);
      if (!(w.end_date === null || MONTH.test(w.end_date ?? ''))) errors.push(`work_history[${i}].end_date must be YYYY-MM or null`);
      if (typeof w.current !== 'boolean') errors.push(`work_history[${i}].current must be true or false`);
      else if (w.current !== (w.end_date === null)) errors.push(`work_history[${i}]: current roles have end_date null and past roles need an end_date`);
      if (MONTH.test(w.start_date ?? '') && MONTH.test(w.end_date ?? '') && w.end_date < w.start_date) errors.push(`work_history[${i}] ends before it starts`);
      if (!Array.isArray(w.bullets) || w.bullets.some(b => !nonEmpty(b))) errors.push(`work_history[${i}].bullets must be non-empty strings`);
    });
  }
  if ('education' in d) {
    if (!Array.isArray(d.education)) errors.push('education must be an array');
    else d.education.forEach((x, i) => {
      if (!isObj(x) || !nonEmpty(x.institution)) return errors.push(`education[${i}] needs institution`);
      if (typeof x.degree !== 'string') errors.push(`education[${i}].degree must be a string`);
      for (const k of ['start_date', 'end_date']) if (x[k] !== undefined && x[k] !== null && !YEAR_OR_MONTH.test(x[k])) errors.push(`education[${i}].${k} must be YYYY or YYYY-MM`);
    });
  }
  if ('skills_with_years' in d) {
    if (!isObj(d.skills_with_years)) errors.push('skills_with_years must be an object of skill -> years');
    else for (const [skill, years] of Object.entries(d.skills_with_years)) if (!skill.trim() || typeof years !== 'number' || !Number.isFinite(years) || years < 0 || years > 60) errors.push(`skills_with_years.${skill} must be a number of years 0-60`);
  }
  if (d.projects !== undefined && !(Array.isArray(d.projects) && d.projects.every(p => isObj(p) && nonEmpty(p.name) && (p.url === undefined || https(p.url)) && Array.isArray(p.bullets)))) errors.push('projects must be objects with name, bullets and optional https url');
  if (d.skills_order !== undefined && !(Array.isArray(d.skills_order) && d.skills_order.every(s => isObj(d.skills_with_years) && s in d.skills_with_years))) errors.push('skills_order may only reorder skills already in skills_with_years');
  if (requireVerified && PLACEHOLDER.test(JSON.stringify(d))) errors.push('placeholder/example values are still present');
  return errors;
}
