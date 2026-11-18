// Shared browser/Node policy; no network, secrets or automatic submissions.
(function (root) {
  const modes = ['approve_before_submit', 'auto_high_confidence', 'dry_run'];
  function decision({ mode = 'approve_before_submit', dryRun = true, score, minimum = 7, unknown = 0, essay = false, approved = false }) {
    if (!modes.includes(mode) || !Number.isFinite(score) || score < 0 || score > 10 || minimum < 7 || minimum > 10) return 'blocked';
    if (score < 5) return 'skipped';
    if (!Number.isInteger(unknown) || unknown < 0 || score < minimum || unknown) return 'needs_review';
    if (dryRun || mode === 'dry_run') return 'dry_run';
    if (mode === 'auto_high_confidence' && score >= 8 && !essay) return 'eligible';
    return approved ? 'eligible' : 'approval_required';
  }
  function parsePayload(text) {
    const value = JSON.parse(text);
    if (!value || value.version !== 1 || !Array.isArray(value.answers) || value.answers.length > 100) throw new Error('Use a version 1 JSON payload with at most 100 labeled answers.');
    if (value.approval_mode !== undefined && !modes.includes(value.approval_mode)) throw new Error('Invalid approval mode.');
    if (value.dry_run !== undefined && typeof value.dry_run !== 'boolean') throw new Error('dry_run must be a boolean.');
    if (value.has_essay !== undefined && typeof value.has_essay !== 'boolean') throw new Error('has_essay must be a boolean.');
    if (value.unknown_questions !== undefined && (!Number.isInteger(value.unknown_questions) || value.unknown_questions < 0)) throw new Error('unknown_questions must be a nonnegative integer.');
    for (const answer of value.answers) {
      if (!answer || typeof answer.label !== 'string' || !answer.label.trim() || typeof answer.value !== 'string' || answer.value.length > 10000 || answer.verified !== true) throw new Error('Every answer needs an exact label, string value and verified: true.');
      if (/password|token|secret|captcha|verification code|one.time code/i.test(answer.label)) throw new Error('Credentials and security challenges cannot be filled.');
    }
    return value;
  }
  const api = { decision, parsePayload, modes };
  root.JobHunterPolicy = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
