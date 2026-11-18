---
name: apply-easy-apply
version: "3.1.0"
description: Load when an eligible job's Apply button opens an in-page modal (LinkedIn Easy Apply, Wellfound or Wuzzuf quick apply) and the form must be prepared and possibly submitted.
triggers:
  - in-page Apply modal
  - apply_type == easy_apply
  - selected job from APPLY reply
requires_mcp:
  - playwright
preconditions:
  - run lock owned, preflight exit 0, auth verified, context loaded (daily-run steps 1-3)
  - job score >= min_match_score and job_id not in applications-log.json
  - per-job tailored file exists with an absolute path
requires_skills:
  - fill-form-answers
  - approval-gate
  - log-application
  - meta-self-verification
verification:
  - fresh snapshot after upload shows the expected filename
  - "dry run: no Submit clicked and status dry_run logged"
  - "real submit: a fresh snapshot shows confirmation text or Applied badge for this company/role, quoted in notes"
  - journal entry updated in place and npm run validate:logs exits 0
---
# Internal / Easy Apply

## When to Use & Preconditions

Use only for in-page modals. If Apply opens a new tab or another site, switch to apply-external-ats.

- **Load when:** in-page Apply modal; apply_type == easy_apply; selected job from APPLY reply.
- **Preconditions (stop if any is false):**
  - run lock owned, preflight exit 0, auth verified, context loaded (daily-run steps 1-3)
  - job score >= min_match_score and job_id not in applications-log.json
  - per-job tailored file exists with an absolute path
- **Requires skills:** `fill-form-answers`, `approval-gate`, `log-application`, `meta-self-verification`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

In-page modal flow (LinkedIn Easy Apply, Wellfound/Wuzzuf quick apply): click the Apply button → `browser_snapshot` of the modal → upload this job's `logs/resumes/<folder>/resume.pdf` FIRST (fill-form-answers.md Traps 1–3) → wait 4 s → fresh snapshot → fill/correct fields → step through Next/Review with a snapshot each step → at Submit, stop for dry run, pause for `approve_before_submit`, or submit only when every gate allows. If the button instead opens a new tab or external site, switch to skills/apply-external-ats.md.

1. Precondition: eligible score, correct owner session, duplicates checked, caps available, known internal flow. Snapshot Apply button; any One-click/Quick Apply may submit immediately, so apply final gate BEFORE first click.
2. Snapshot dialog; resolve all fields using fill-form-answers.md, upload verified resume. Unknown required question -> screenshot, open_questions, needs_review, leave tab open. Do not fabricate answers or modify profile.
3. Pace/snapshot between steps. Verify contact info, legal facts, resume version, consents and summary. Uncheck Follow company unless preferences.follow_companies:true.
4. dry_run:true: never Submit (including quick-apply); stop before final action, discard draft only when safe, log dry_run. Do not create a submission reservation.
5. Otherwise run skills/approval-gate.md, then re-read history and apply applicationDecision, including unresolved-reservation caps and the current job-bound approval/essay flag. Approval alone never overrides other gates. Atomically reserve needs_review/submission_uncertain:true before submitting; journal and validate. Submit once only. Confirm explicit receipt/thank-you text and job identity; update same entry to applied/applied_at/submission_uncertain:false.
6. Timeout or ambiguous outcome: preserve reservation as needs_review and never retry automatically. Stop whole run on CAPTCHA/2FA/warning/rate limit/three consecutive errors; a mid-run login wall follows fill-form-answers.md Trap 5 (pause, CONTINUE, else abort). Local-first journal then Notion sync.

After the single Submit click run skills/meta-self-verification.md; if the modal shows validation errors instead, run skills/meta-structured-debugging.md (nothing was submitted, so the reservation stays needs_review until fixed and re-approved).


## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Clicking a "Quick apply" button before the final gate → ✅ one-click buttons may submit immediately; gate first.
- ❌ Retrying Submit after a spinner/timeout → ✅ keep submission_uncertain and needs_review; never resubmit.
- ❌ Leaving "Follow company" ticked by default → ✅ untick unless preferences.follow_companies is true.

### Self-verification check (before reporting this step complete)
- [ ] fresh snapshot after upload shows the expected filename
- [ ] dry run: no Submit clicked and status dry_run logged
- [ ] real submit: a fresh snapshot shows confirmation text or Applied badge for this company/role, quoted in notes
- [ ] journal entry updated in place and npm run validate:logs exits 0

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
