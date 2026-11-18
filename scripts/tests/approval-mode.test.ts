import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { applicationDecision, Guardrails } from '../../schemas/index';
// policy.js is a vanilla browser script; evaluate its global API in a Node VM.
import { runInNewContext } from 'node:vm';
const scope: { JobHunterPolicy?: { decision: (input: object) => string } } = {};
runInNewContext(readFileSync(new URL('../../extension/policy.js', import.meta.url), 'utf8'), scope);
const config = parse(readFileSync(new URL('../../config/guardrails.yaml', import.meta.url), 'utf8'));
const job = { job_id: 'linkedin:test', match_score: 8, apply_type: 'easy_apply' as const, open_questions: [] };
const limits = { dry_run: false, min_match_score: 7, max_applications_per_day: 20, max_per_platform: { linkedin: 12 } };
describe('submission approval contracts', () => {
  it('defaults to approve_before_submit and rejects unknown modes', () => {
    expect(Guardrails.parse(config).approval_mode).toBe('approve_before_submit');
    for (const mode of ['approve_before_submit', 'auto_high_confidence', 'dry_run']) expect(Guardrails.safeParse({ ...config, approval_mode: mode }).success).toBe(true);
    expect(Guardrails.safeParse({ ...config, approval_mode: 'always' }).success).toBe(false);
  });
  it('requires exact approval by default', () => {
    expect(applicationDecision(job, [], 'linkedin', '2026-11-18', limits)).toBe('approval_required');
    expect(applicationDecision(job, [], 'linkedin', '2026-11-18', limits, { approved: true })).toBe('eligible');
  });
  it('automates only score >=8 without essays', () => {
    const l = { ...limits, approval_mode: 'auto_high_confidence' as const };
    expect(applicationDecision(job, [], 'linkedin', '2026-11-18', l)).toBe('eligible');
    expect(applicationDecision({ ...job, match_score: 7 }, [], 'linkedin', '2026-11-18', l)).toBe('approval_required');
    expect(applicationDecision(job, [], 'linkedin', '2026-11-18', l, { has_essay: true })).toBe('approval_required');
  });
  it('score 6 and unknown factual questions cannot be approved past the minimum', () => {
    expect(applicationDecision({ ...job, match_score: 6 }, [], 'linkedin', '2026-11-18', limits, { approved: true })).toBe('needs_review');
    expect(applicationDecision({ ...job, open_questions: [{ question: 'Unknown visa status' }] }, [], 'linkedin', '2026-11-18', limits, { approved: true })).toBe('needs_review');
  });
  it('both dry-run controls override approval and browser policy matches', () => {
    for (const mode of ['approve_before_submit', 'auto_high_confidence', 'dry_run'] as const) {
      expect(applicationDecision(job, [], 'linkedin', '2026-11-18', { ...limits, approval_mode: mode, dry_run: true }, { approved: true })).toBe('dry_run');
      expect(scope.JobHunterPolicy?.decision({ mode, dryRun: true, score: 8, approved: true })).toBe('dry_run');
    }
    expect(applicationDecision(job, [], 'linkedin', '2026-11-18', { ...limits, approval_mode: 'dry_run' }, { approved: true })).toBe('dry_run');
  });
});
