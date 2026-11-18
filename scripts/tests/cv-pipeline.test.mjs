import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkResumeData, RESUME_DATA_REQUIRED } from '../../bin/resume-data.mjs';
import { readZip, writeZip, extractPdfText, assessText } from '../../bin/cv-tools.mjs';

const repo = fileURLToPath(new URL('../..', import.meta.url));
const cli = path.join(repo, 'bin', 'job-hunter.mjs');
function home(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'job-hunter-cv-'));
  const cwd = path.join(base, 'agent'); fs.mkdirSync(path.join(cwd, 'context'), { recursive: true }); fs.mkdirSync(path.join(cwd, 'assets'));
  fs.writeFileSync(path.join(cwd, '.job-hunter-install.json'), '{"version":1,"scope":"local"}');
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8', env: { ...process.env, HOME: path.join(base, 'home'), USERPROFILE: path.join(base, 'home'), NO_COLOR: '1' }, timeout: 90000 });
  return { cwd, run, file: (name, data) => { const f = path.join(cwd, name); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); return f; } };
}
const sentence = 'Backend engineer building TypeScript payment services with PostgreSQL and Docker for merchant partners across three markets';
const cvLines = ['Mona Adel', 'mona.adel@mail.test +20 1012345678 https://github.com/mona-adel-test', ...Array.from({ length: 6 }, (_, i) => `${sentence} project ${i + 1}`)];
function pdf(objects) {
  const parts = [Buffer.from('%PDF-1.4\n', 'latin1')]; const offsets = []; let size = parts[0].length;
  objects.forEach((body, i) => {
    const chunk = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`, 'latin1'), ...(Array.isArray(body) ? body : [body]).map(p => Buffer.isBuffer(p) ? p : Buffer.from(p, 'latin1')), Buffer.from('\nendobj\n', 'latin1')]);
    offsets.push(size); parts.push(chunk); size += chunk.length;
  });
  parts.push(Buffer.from(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${size}\n%%EOF\n`, 'latin1'));
  return Buffer.concat(parts);
}
const stream = (content, flate) => { const data = flate ? zlib.deflateSync(Buffer.from(content, 'latin1')) : Buffer.from(content, 'latin1'); return [`<< /Length ${data.length}${flate ? ' /Filter /FlateDecode' : ''} >>\nstream\n`, data, '\nendstream']; };
const textPdf = (lines, flate = true) => pdf([
  '<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  stream(`BT /F1 10 Tf 40 800 Td ${lines.map(l => `(${l.replace(/[()\\]/g, '\\$&')}) Tj 0 -14 Td`).join(' ')} ET`, flate),
]);
const verified = {
  owner_verified: true, verified_at: '2026-11-18T03:00:00Z', first_name: 'Mona', last_name: 'Adel', email: 'mona.adel@mail.test', phone_country_code: '+20', phone_national: '1012345678',
  city: 'Cairo', country: 'Egypt', city_autocomplete: 'Cairo', linkedin_url: 'https://www.linkedin.com/in/mona-adel-test', github_url: 'https://github.com/mona-adel-test', portfolio_url: '',
  summary: 'Backend engineer with five years of TypeScript and Node.js services.',
  work_history: [{ employer: 'Nilepay', title: 'Senior Backend Engineer', location: 'Cairo, Egypt', start_date: '2022-03', end_date: null, current: true, bullets: ['Designed TypeScript payment APIs <fast & safe>.'] }],
  education: [{ institution: 'Cairo University', degree: 'BSc', field_of_study: 'Computer Engineering', start_date: '2014', end_date: '2019' }],
  skills_with_years: { TypeScript: 5, 'Node.js': 5 }, skills_order: ['Node.js', 'TypeScript'],
  target: { company: 'Acme Pay', role: 'Senior Backend Engineer', job_id: 'linkedin:123' },
  tailoring_notes: { jd_asked: ['Node.js'], changes: ['Node.js listed first'], gaps: ['Kafka'] },
};
const jobDir = cwd => path.join(cwd, 'logs', 'resumes', 'acme-pay-senior-backend-engineer-linkedin-123');

test('resume-data JSON schema and zero-dependency validator share required fields; example is never usable', () => {
  const schema = JSON.parse(fs.readFileSync(path.join(repo, 'schemas', 'resume-data.schema.json'), 'utf8'));
  assert.deepEqual([...schema.required].sort(), [...RESUME_DATA_REQUIRED].sort());
  for (const key of ['first_name', 'last_name', 'phone_country_code', 'phone_national', 'city_autocomplete', 'work_history', 'education', 'skills_with_years']) assert.ok(schema.properties[key], key);
  const example = JSON.parse(fs.readFileSync(path.join(repo, 'context', 'resume-data.json.example'), 'utf8'));
  assert.deepEqual(checkResumeData(example), []);
  assert.equal(example.owner_verified, false);
  assert.ok(checkResumeData(example, { requireVerified: true }).length >= 2);
  assert.deepEqual(checkResumeData(verified, { requireVerified: true }), []);
});
test('validator rejects split-field and repeater mistakes', () => {
  const bad = (patch, pattern) => assert.ok(checkResumeData({ ...verified, ...patch }).some(e => pattern.test(e)), String(pattern));
  bad({ phone_country_code: '20' }, /phone_country_code/);
  bad({ phone_national: '+20 101' }, /phone_national/);
  bad({ github_url: 'http://github.com/x' }, /github_url/);
  bad({ work_history: [{ ...verified.work_history[0], current: true, end_date: '2023-01' }] }, /current roles/);
  bad({ work_history: [{ ...verified.work_history[0], current: false, start_date: '2023-05', end_date: '2023-01' }] }, /ends before/);
  bad({ skills_with_years: { TypeScript: 'five' } }, /skills_with_years/);
  bad({ skills_order: ['Kafka'] }, /skills_order/);
  const { email, ...missing } = verified; assert.ok(email); assert.ok(checkResumeData(missing).includes('missing email'));
});
test('parse-cv tier 1 reads markdown and writes a private report with unverified contact candidates', t => {
  const h = home(t); h.file('assets/resume.md', cvLines.join('\n'));
  const r = h.run('parse-cv'); assert.equal(r.status, 0, r.stdout + r.stderr);
  const report = JSON.parse(fs.readFileSync(path.join(h.cwd, 'context', 'cv-extracted.report.json'), 'utf8'));
  assert.equal(report.tier, 'tier1_text'); assert.equal(report.quality, 'readable'); assert.equal(report.owner_verified, false);
  assert.equal(report.contact_candidates.email, 'mona.adel@mail.test');
  assert.equal(report.contact_candidates.github_url, 'https://github.com/mona-adel-test');
  assert.ok(!r.stdout.includes(sentence), 'CV text is not echoed to the terminal');
});
test('parse-cv tier 2 extracts plain and Flate-compressed PDF text locally', t => {
  for (const flate of [false, true]) {
    const h = home(t); h.file('assets/resume.pdf', textPdf(cvLines, flate));
    const r = h.run('parse-cv'); assert.equal(r.status, 0, r.stdout);
    const text = fs.readFileSync(path.join(h.cwd, 'context', 'cv-extracted.txt'), 'utf8');
    assert.match(text, /Mona Adel\n/); assert.ok(text.includes(`${sentence} project 6`));
    assert.match(r.stdout, /tier2_local_extraction/);
  }
});
test('parse-cv tier 3 flags scanned-image and garbled PDFs and asks for pasted text', t => {
  const h = home(t);
  const scanned = pdf(['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>',
    ['<< /Type /XObject /Subtype /Image /Width 1 /Height 1 /ColorSpace /DeviceGray /BitsPerComponent 8 /Length 1 >>\nstream\n', Buffer.from([0]), '\nendstream'],
    stream('q 595 0 0 842 0 0 cm /Im1 Do Q', true)]);
  h.file('assets/resume.pdf', scanned);
  let r = h.run('parse-cv'); assert.equal(r.status, 3);
  assert.match(r.stdout, /tier3_scanned_image/); assert.match(r.stdout, /paste your CV text/i); assert.match(r.stdout, /Applicant tracking systems/);
  const garbled = textPdf(Array.from({ length: 8 }, () => 'Bkrt Zxqv Mnpl Trsk Wvbn Qzpr Hjkl Gfds Xcvb'));
  const g = h.file('scrambled.pdf', garbled);
  r = h.run('parse-cv', g); assert.equal(r.status, 3); assert.match(r.stdout, /quality=garbled/); assert.match(r.stdout, /tier3_unreadable_pdf/);
});
test('parse-cv reads DOCX and refuses legacy .doc / symlinks with a paste fallback', t => {
  const h = home(t);
  const xml = `<w:document xmlns:w="x"><w:body>${cvLines.map(l => `<w:p><w:r><w:t>${l.replace(/&/g, '&amp;')}</w:t></w:r></w:p>`).join('')}</w:body></w:document>`;
  h.file('assets/resume.docx', writeZip([{ name: 'word/document.xml', data: Buffer.from(xml) }]));
  let r = h.run('parse-cv'); assert.equal(r.status, 0, r.stdout);
  assert.match(fs.readFileSync(path.join(h.cwd, 'context', 'cv-extracted.txt'), 'utf8'), /^Mona Adel\n/);
  r = h.run('parse-cv', h.file('old.doc', 'binary')); assert.equal(r.status, 3); assert.match(r.stdout, /tier2_ask_for_text/);
  if (process.platform !== 'win32') { fs.symlinkSync(path.join(h.cwd, 'old.doc'), path.join(h.cwd, 'link.md')); assert.equal(h.run('parse-cv', 'link.md').status, 1); }
});
test('render-cv writes html, Word .doc, .docx, txt and tailoring notes into one per-job folder', t => {
  const h = home(t); const payload = h.file('payload.json', JSON.stringify(verified));
  const r = h.run('render-cv', payload, '--no-pdf'); assert.equal(r.status, 0, r.stdout + r.stderr);
  const dir = jobDir(h.cwd);
  const html = fs.readFileSync(path.join(dir, 'resume.html'), 'utf8');
  assert.match(html, /<h1>Mona Adel<\/h1>/); assert.match(html, /&lt;fast &amp; safe&gt;/); assert.ok(!/\{\{|<script/i.test(html));
  assert.ok(!html.includes('<h2>Projects</h2>'), 'empty sections are omitted');
  assert.ok(html.indexOf('Node.js · TypeScript') > 0, 'skills follow the per-job order');
  const doc = fs.readFileSync(path.join(dir, 'resume.doc'), 'utf8');
  assert.match(doc, /xmlns:w="urn:schemas-microsoft-com:office:word"/); assert.match(doc, /Senior Backend Engineer — Nilepay/);
  const docx = readZip(fs.readFileSync(path.join(dir, 'resume.docx')));
  assert.ok(docx.names.includes('[Content_Types].xml')); assert.match(docx.get('word/document.xml').toString('utf8'), /Mona Adel/);
  const txt = fs.readFileSync(path.join(dir, 'resume.txt'), 'utf8');
  assert.match(txt, /^Mona Adel\n/); assert.match(txt, /\nEXPERIENCE\n/); assert.match(txt, /- Designed TypeScript payment APIs <fast & safe>\./); assert.ok(!/<\/?(?:h\d|p|li|ul|section|a)\b/i.test(txt));
  assert.match(fs.readFileSync(path.join(dir, 'tailoring-notes.md'), 'utf8'), /Kafka/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'resume.render-report.json'), 'utf8')).pdf, 'skipped');
  // render-cv also accepts the tailored HTML it produced (agent-edited copies)
  assert.equal(h.run('render-cv', path.join(dir, 'resume.html'), '--out-dir', 'second', '--no-pdf').status, 0);
  assert.ok(fs.existsSync(path.join(h.cwd, 'second', 'resume.docx')));
});
test('render-cv refuses unverified, placeholder or unsafe input and writes nothing', t => {
  const h = home(t);
  for (const [name, body] of [['unverified.json', { ...verified, owner_verified: false }], ['example.json', { ...verified, email: 'a@example.com' }]]) {
    const r = h.run('render-cv', h.file(name, JSON.stringify(body)), '--no-pdf'); assert.equal(r.status, 1); assert.match(r.stdout, /Resume refused/);
  }
  const r = h.run('render-cv', h.file('evil.html', '<html><body><h1>X</h1><script>fetch("https://x.test")</script></body></html>'), '--no-pdf');
  assert.equal(r.status, 1); assert.match(r.stdout, /Render refused/);
  assert.ok(!fs.existsSync(path.join(h.cwd, 'logs')) && !fs.existsSync(path.join(h.cwd, 'resume.txt')));
  assert.equal(h.run('render-cv', 'x.json', '--out-dir').status, 1);
});
test('cover-letter template exists and render-cv needs owner approval and 80-250 words', t => {
  const template = fs.readFileSync(path.join(repo, 'templates', 'ats-cover-letter-template.html'), 'utf8');
  for (const slot of ['FULL_NAME', 'CONTACT_TEXT', 'RECIPIENT_TEXT', 'BODY_HTML', 'SIGNOFF_TEXT']) assert.ok(template.includes(`{{${slot}}}`), slot);
  assert.match(template, /content="cover_letter"/); assert.match(template, /Content-Security-Policy/); assert.ok(!/<script/i.test(template));
  const h = home(t);
  const paragraph = 'I build TypeScript payment services with PostgreSQL and Docker, and I would bring that verified experience to your backend team with careful testing and clear documentation for every release.';
  const letter = { document: 'cover_letter', owner_approved: true, full_name: 'Mona Adel', contact_text: 'mona.adel@mail.test · +20 1012345678', target: verified.target, paragraphs: [paragraph, paragraph, paragraph] };
  let r = h.run('render-cv', h.file('cl1.json', JSON.stringify({ ...letter, owner_approved: false })), '--no-pdf'); assert.equal(r.status, 1); assert.match(r.stdout, /owner_approved/);
  r = h.run('render-cv', h.file('cl2.json', JSON.stringify({ ...letter, paragraphs: ['Too short.', 'Still short.'] })), '--no-pdf'); assert.equal(r.status, 1); assert.match(r.stdout, /80-250 words/);
  r = h.run('render-cv', h.file('cl3.json', JSON.stringify(letter)), '--no-pdf'); assert.equal(r.status, 0, r.stdout);
  const txt = fs.readFileSync(path.join(jobDir(h.cwd), 'cover-letter.txt'), 'utf8');
  assert.match(txt, /Hiring Team, Acme Pay/); assert.match(txt, /Application for Senior Backend Engineer/);
});
test('render-cv PDF is under 200 KB and parse-cv can read it back (skips without local Chromium)', t => {
  const h = home(t); const r = h.run('render-cv', h.file('payload.json', JSON.stringify(verified)));
  if (r.status === 2) return t.skip('Chromium/Playwright not available in this environment');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const file = path.join(jobDir(h.cwd), 'resume.pdf'); const size = fs.statSync(file).size;
  assert.ok(size < 200 * 1024, `PDF is ${size} bytes`);
  const text = extractPdfText(fs.readFileSync(file)).text;
  assert.match(text, /Mona Adel/); assert.match(text, /Senior Backend Engineer — Nilepay/);
  assert.ok(assessText(text).words > 20);
});
