# BuiltIn playbook

Preconditions: AGENTS.md, successful preflight/auth/context loading, fresh accessibility snapshots, platform terms permit automation. Never bypass bot defenses.

1. For auth_required:true, open the auth check URL and snapshot. Confirm a named account/menu, not merely absence of Sign in. Public boards with auth_required:false may be read logged-out; a new login/2FA wall stops the whole run.
2. Pace every navigation/click/type/select/upload by a random 3–8 seconds. Snapshot results; use roles/names/refs, not CSS selectors.
3. Snapshot job list and open title. Record canonical role ID, office location and hybrid/remote eligibility. Apply routes to company ATS or account prompt; use ATS dispatcher or review rather than creating an account.
4. Extract company, title, location, timestamp (unknown stays unknown), full description, canonical URL and builtin:<stable posting id>. If no reliable identifier exists, review; do not invent one. Limit collection to target.max_results; scroll small increments only when more results are needed.
5. Apply preferences filters and score-job.md. Read the existing journal before every application. Below 5 skipped; 5 to below 7 review; >=7 eligible subject to all safety gates.
6. Internal forms use apply-easy-apply.md. External redirects use apply-external-ats.md; inspect destination, snapshot and never guess an ATS. Unknown/account-gated flow is manual_apply + needs_review.
7. Upload only the owner-verified local resume via fill-form-answers.md. Missing/unknown answers, consent ambiguity or irreversible profile changes stop this application for review.
8. Any quick-apply button that may submit is a FINAL SUBMIT: reserve the job, validate/reload caps, verify all facts, and never click in dry run. Confirm receipt before marking applied. Uncertain receipt stays needs_review/submission_uncertain.
9. Local-first journal then idempotent Notion sync; stop immediately on CAPTCHA, 2FA, login wall, warning, rate limit or three consecutive errors.
