import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateSkills, parseFrontmatter, SECTIONS, REQUIRED_KEYS } from '../../bin/skills.mjs';
import { verifyTailoredCv, findAiSlop } from '../../bin/verify-cv.mjs';
import { pullAts, atsEndpoint, parseTargetsYaml, collectConfiguredBoards } from '../../bin/ats-harvester.mjs';

const repo = fileURLToPath(new URL('../..', import.meta.url));
const cli = path.join(repo, 'bin', 'job-hunter.mjs');

function runCli(cwd, ...args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
    timeout: 60000,
  });
}

function tempWorkspace(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'job-hunter-skills-'));
  const home = path.join(base, 'home');
  const root = path.join(base, 'agent');
  fs.mkdirSync(home, { recursive: true });
  fs.mkdirSync(root, { recursive: true });
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, HOME: home, USERPROFILE: home, NO_COLOR: '1' },
    timeout: 60000,
  });
  return { base, home, root, run };
}

test('skills-manifest.json and REGISTRY.md pass validateSkills with all 4 meta-skills and 8 career-ops skills', () => {
  const manifestPath = path.join(repo, 'skills', 'skills-manifest.json');
  const registryPath = path.join(repo, 'skills', 'REGISTRY.md');
  assert.ok(fs.existsSync(manifestPath), 'skills/skills-manifest.json must exist');
  assert.ok(fs.existsSync(registryPath), 'skills/REGISTRY.md must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.manifest_version, 1);
  assert.ok(Array.isArray(manifest.skills) && manifest.skills.length >= 58);

  const names = new Set(manifest.skills.map(s => s.name));
  const expected = [
    'meta-self-verification',
    'meta-dom-recovery',
    'meta-context-compaction',
    'meta-structured-debugging',
    'ghost-job-detector',
    'fact-check-guard',
    'humanize-writing',
    'hiring-manager-outreach',
    'direct-email-drafter',
    'eeo-consent-handler',
    'interview-dossier',
    'direct-ats-harvester',
  ];
  for (const name of expected) {
    assert.ok(names.has(name), `manifest missing ${name}`);
    const entry = manifest.skills.find(s => s.name === name);
    const full = path.join(repo, ...entry.path.split('/'));
    const { data, body, error } = parseFrontmatter(fs.readFileSync(full, 'utf8'));
    assert.equal(error, null, `${entry.path} frontmatter error: ${error}`);
    for (const k of REQUIRED_KEYS) assert.ok(k in data, `${entry.path} missing ${k}`);
    for (const sec of SECTIONS) assert.ok(body.includes(`## ${sec}`), `${entry.path} missing ## ${sec}`);
  }

  const res = validateSkills(repo, { checkGenerated: true });
  assert.deepEqual(res.errors, []);
});

test('job-hunter skills list and skills validate pass via CLI', () => {
  const listRes = runCli(repo, 'skills', 'list');
  assert.equal(listRes.status, 0, listRes.stdout + listRes.stderr);
  assert.match(listRes.stdout, /ghost-job-detector/);
  assert.match(listRes.stdout, /fact-check-guard/);
  assert.match(listRes.stdout, /meta-self-verification/);

  const valRes = runCli(repo, 'skills', 'validate');
  assert.equal(valRes.status, 0, valRes.stdout + valRes.stderr);
  assert.match(valRes.stdout, /Validated \d+ skills with 0 errors/);
});

test('skills install, enable, and export work cleanly in an isolated workspace', t => {
  const w = tempWorkspace(t);
  assert.equal(w.run('init').status, 0);

  // Create a local agent_skills-compatible folder (<name>/SKILL.md)
  const extDir = path.join(w.base, 'community-pack', 'offer-negotiation');
  fs.mkdirSync(extDir, { recursive: true });
  fs.writeFileSync(path.join(extDir, 'SKILL.md'), [
    '---',
    'name: offer-negotiation',
    'version: "1.0.0"',
    'description: Load when an offer letter arrives and salary benchmarks must be compared calmly.',
    'triggers:',
    '  - offer received',
    'requires_mcp:',
    '  - none',
    'preconditions:',
    '  - written offer terms visible',
    'requires_skills: []',
    'verification:',
    '  - owner confirmed counter-offer numbers',
    '---',
    '# Offer negotiation',
    '',
    '## When to Use & Preconditions',
    'Use after receiving a written offer when compensation needs review.',
    '',
    '## Deterministic Step-by-Step Execution',
    'Compare base, equity, and benefits against verified minimum floor.',
    '',
    '## Anti-Patterns (What NEVER To Do) & Self-Verification Check',
    '- Verify numbers before sending any counter-offer.',
    '',
  ].join('\n'));

  const inst = w.run('skills', 'install', path.join(w.base, 'community-pack'));
  assert.equal(inst.status, 0, inst.stdout + inst.stderr);
  assert.ok(fs.existsSync(path.join(w.root, 'skills', 'community', 'offer-negotiation', 'SKILL.md')));

  let manifest = JSON.parse(fs.readFileSync(path.join(w.root, 'skills', 'skills-manifest.json'), 'utf8'));
  let entry = manifest.skills.find(s => s.name === 'offer-negotiation');
  assert.ok(entry);
  assert.equal(entry.enabled, false, 'community skills must start disabled until reviewed');

  assert.equal(w.run('skills', 'enable', 'offer-negotiation').status, 0);
  manifest = JSON.parse(fs.readFileSync(path.join(w.root, 'skills', 'skills-manifest.json'), 'utf8'));
  entry = manifest.skills.find(s => s.name === 'offer-negotiation');
  assert.equal(entry.enabled, true);

  // Preserve custom user files during export
  const customRule = path.join(w.root, '.cursor', 'rules', 'jh-custom.mdc');
  fs.mkdirSync(path.dirname(customRule), { recursive: true });
  fs.writeFileSync(customRule, 'owner custom rule');

  for (const ide of ['claude', 'cursor', 'antigravity', 'windsurf']) {
    const exp = w.run('skills', 'export', '--ide', ide);
    assert.equal(exp.status, 0, `${ide}: ${exp.stdout} ${exp.stderr}`);
  }
  assert.ok(fs.existsSync(path.join(w.root, '.claude', 'skills', 'jh-offer-negotiation', 'SKILL.md')));
  assert.ok(fs.existsSync(path.join(w.root, '.agent', 'workflows', 'jh-offer-negotiation.md')));
  assert.ok(fs.existsSync(path.join(w.root, '.windsurf', 'rules', 'jh-offer-negotiation.md')));
  assert.equal(fs.readFileSync(customRule, 'utf8'), 'owner custom rule');
});

test('verify-cv and render-cv detect fabricated metrics/employers and block rendering', t => {
  const w = tempWorkspace(t);
  fs.mkdirSync(path.join(w.root, 'context'), { recursive: true });
  fs.writeFileSync(path.join(w.root, '.job-hunter-install.json'), '{"version":1,"scope":"local"}\n');

  const baseline = {
    owner_verified: true,
    verified_at: '2026-11-18T03:00:00Z',
    first_name: 'Mona',
    last_name: 'Adel',
    email: 'mona.adel@mail.test',
    phone_country_code: '+20',
    phone_national: '1012345678',
    city: 'Cairo',
    country: 'Egypt',
    city_autocomplete: 'Cairo',
    linkedin_url: 'https://www.linkedin.com/in/mona-adel-test',
    github_url: 'https://github.com/mona-adel-test',
    portfolio_url: '',
    summary: 'Backend engineer with 5 years of TypeScript and Node.js APIs.',
    work_history: [
      {
        employer: 'Nilepay',
        title: 'Senior Backend Engineer',
        location: 'Cairo, Egypt',
        start_date: '2022-03',
        end_date: null,
        current: true,
        bullets: ['Built TypeScript payment services and PostgreSQL migrations.'],
      },
    ],
    education: [
      { institution: 'Cairo University', degree: 'BSc', field_of_study: 'Computer Engineering', start_date: '2014', end_date: '2019' },
    ],
    projects: [],
    skills_with_years: { TypeScript: 5, 'Node.js': 5 },
    target: { company: 'Acme Pay', role: 'Senior Backend Engineer', job_id: 'linkedin:123' },
    tailoring_notes: { jd_asked: ['Node.js'], changes: ['Reordered skills'], gaps: ['Kafka'] },
  };
  fs.writeFileSync(path.join(w.root, 'context', 'resume-data.json'), JSON.stringify(baseline, null, 2));
  fs.writeFileSync(path.join(w.root, 'context', 'profile.md'), '# Profile\n- full_name: Mona Adel\n- years_experience: 5\n');

  const validPayload = path.join(w.root, 'valid.json');
  fs.writeFileSync(validPayload, JSON.stringify(baseline, null, 2));
  const okRes = w.run('verify-cv', validPayload);
  assert.equal(okRes.status, 0, okRes.stdout + okRes.stderr);

  // Fabricated metric 45% + fabricated employer GhostCorp
  const badPayload = path.join(w.root, 'bad.json');
  fs.writeFileSync(badPayload, JSON.stringify({
    ...baseline,
    work_history: [
      {
        employer: 'GhostCorp',
        title: 'Principal Architect',
        location: 'Cairo, Egypt',
        start_date: '2022-03',
        end_date: null,
        current: true,
        bullets: ['Cut API latency by 45% across 12 engineers.'],
      },
    ],
  }, null, 2));
  const badCheck = verifyTailoredCv(w.root, badPayload);
  assert.equal(badCheck.ok, false);
  assert.ok(badCheck.errors.some(e => e.includes('GhostCorp')));
  assert.ok(badCheck.errors.some(e => e.includes('45%')));

  const blockedRender = w.run('render-cv', badPayload, '--no-pdf');
  assert.equal(blockedRender.status, 1);
  assert.match(blockedRender.stdout, /Fact-check blocked rendering/);
  assert.ok(!fs.existsSync(path.join(w.root, 'logs', 'resumes')), 'render-cv must write nothing when fact-check fails');

  // AI-slop detector
  const slop = findAiSlop('I am thrilled to apply and delve into a fast-paced environment — moreover, I spearheaded synergy — across teams.');
  assert.ok(slop.banned_phrases.includes('delve'));
  assert.ok(slop.banned_phrases.includes('spearheaded'));
  assert.equal(slop.em_dash_count, 2);
});

test('pull-ats parses targets, enforces allowlisted endpoints, filters by role, and writes logs/ats-harvest.json', async t => {
  const w = tempWorkspace(t);
  fs.mkdirSync(path.join(w.root, 'context'), { recursive: true });
  fs.writeFileSync(path.join(w.root, '.job-hunter-install.json'), '{"version":1,"scope":"local"}\n');
  fs.writeFileSync(path.join(w.root, 'context', 'preferences.yaml'), 'roles:\n  - Frontend Engineer\nlocations:\n  - Remote\n');
  fs.writeFileSync(path.join(w.root, 'context', 'targets.yaml'), [
    'targets:',
    '  - name: "Greenhouse"',
    '    platform: "greenhouse"',
    '    enabled: true',
    '    url: "https://boards.greenhouse.io/acme"',
    '    board_tokens:',
    '      - acme',
    '  - name: "Lever"',
    '    platform: "lever"',
    '    enabled: false',
    '    url: "https://jobs.lever.co/beta"',
    '    board_tokens: ["beta"]',
  ].join('\n'));

  const parsed = parseTargetsYaml(fs.readFileSync(path.join(w.root, 'context', 'targets.yaml'), 'utf8'));
  assert.equal(collectConfiguredBoards(parsed).length, 1);
  assert.equal(collectConfiguredBoards(parsed, { includeDisabled: true }).length, 2);
  assert.throws(() => atsEndpoint('greenhouse', '../evil'), /Invalid board token/);

  const mockFetch = async url => {
    if (url.includes('boards-api.greenhouse.io/v1/boards/acme')) {
      return {
        ok: true,
        json: async () => ({
          jobs: [
            { id: 101, title: 'Senior Frontend Engineer', location: { name: 'Remote - EMEA' }, absolute_url: 'https://boards.greenhouse.io/acme/jobs/101', updated_at: '2026-11-17T10:00:00Z', content: '<p>React TypeScript</p>' },
            { id: 102, title: 'Account Executive', location: { name: 'New York' }, absolute_url: 'https://boards.greenhouse.io/acme/jobs/102', updated_at: '2026-11-17T10:00:00Z', content: '<p>Enterprise sales</p>' },
          ],
        }),
      };
    }
    if (url.includes('api.lever.co/v0/postings/beta')) {
      return {
        ok: true,
        json: async () => [
          { id: 'abc', text: 'Frontend Engineer', categories: { location: 'Remote' }, hostedUrl: 'https://jobs.lever.co/beta/abc', createdAt: Date.parse('2026-11-16T00:00:00Z'), descriptionPlain: 'TypeScript UI' },
        ],
      };
    }
    if (url.includes('api.ashbyhq.com/posting-api/job-board/gamma')) {
      return {
        ok: true,
        json: async () => ({
          jobs: [
            { id: 'ash-1', title: 'Staff Frontend Engineer', location: 'Worldwide', isRemote: true, jobUrl: 'https://jobs.ashbyhq.com/gamma/ash-1', publishedAt: '2026-11-17T00:00:00Z', descriptionPlain: 'Design systems' },
          ],
        }),
      };
    }
    return { ok: false, status: 404 };
  };

  const res = await pullAts(w.root, {
    boards: [{ platform: 'greenhouse', token: 'acme' }, { platform: 'lever', token: 'beta' }, { platform: 'ashby', token: 'gamma' }],
    fetchImpl: mockFetch,
  });
  assert.equal(res.count, 3, 'all 3 matching Remote Frontend Engineer roles should pass filter, Account Executive filtered out');
  assert.ok(fs.existsSync(path.join(w.root, 'logs', 'ats-harvest.json')));
  const saved = JSON.parse(fs.readFileSync(path.join(w.root, 'logs', 'ats-harvest.json'), 'utf8'));
  assert.equal(saved.jobs[0].job_id, 'greenhouse:acme-101');
  assert.equal(saved.jobs[1].job_id, 'lever:beta-abc');
  assert.equal(saved.jobs[2].job_id, 'ashby:gamma-ash-1');
});

test('example form-answers and targets templates include EEO compliance defaults and board_tokens safely', () => {
  const answers = fs.readFileSync(path.join(repo, 'context', 'form-answers.yaml.example'), 'utf8');
  assert.match(answers, /^eeo_and_compliance_defaults:/m);
  assert.match(answers, /gender:\s*"Decline to self-identify"/);
  assert.match(answers, /gdpr_privacy_consent:\s*true/);
  assert.match(answers, /referral_source:\s*"LinkedIn"/);

  const targets = fs.readFileSync(path.join(repo, 'context', 'targets.yaml.example'), 'utf8');
  assert.match(targets, /board_tokens:\s*\[\]/);
  // Single top-level YAML key preserved for add-platform compatibility
  const topKeys = targets.split(/\r?\n/).filter(l => /^[^\s#]/.test(l));
  assert.deepEqual(topKeys, ['targets:']);
});
