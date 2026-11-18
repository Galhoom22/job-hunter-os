# Internal / Easy Apply — v2

1. Precondition: eligible score, correct owner session, duplicates checked, caps available, known internal flow. Snapshot Apply button; any One-click/Quick Apply may submit immediately, so apply final gate BEFORE first click.
2. Snapshot dialog; resolve all fields using fill-form-answers.md, upload verified resume. Unknown required question -> screenshot, open_questions, needs_review, leave tab open. Do not fabricate answers or modify profile.
3. Pace/snapshot between steps. Verify contact info, legal facts, resume version, consents and summary. Uncheck Follow company unless preferences.follow_companies:true.
4. dry_run:true: never Submit (including quick-apply); stop before final action, discard draft only when safe, log dry_run. Do not create a submission reservation.
5. Otherwise run skills/approval-gate.md, then re-read history and apply applicationDecision, including unresolved-reservation caps and the current job-bound approval/essay flag. Approval alone never overrides other gates. Atomically reserve needs_review/submission_uncertain:true before submitting; journal and validate. Submit once only. Confirm explicit receipt/thank-you text and job identity; update same entry to applied/applied_at/submission_uncertain:false.
6. Timeout or ambiguous outcome: preserve reservation as needs_review and never retry automatically. Stop whole run on CAPTCHA/2FA/login wall/warning/rate limit/three consecutive errors. Local-first journal then Notion sync.
