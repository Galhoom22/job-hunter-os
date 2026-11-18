---
name: glassdoor
version: "1.1.0"
description: Load when an enabled target has platform glassdoor (Glassdoor) and jobs must be discovered, read in full and routed to the right apply flow.
triggers:
  - target.platform == glassdoor
  - job URL on Glassdoor
requires_mcp:
  - playwright
preconditions:
  - run lock owned, preflight exit 0, auth verified, context loaded (daily-run steps 1-3)
  - Glassdoor target enabled in context/targets.yaml
requires_skills:
  - discover-jobs
  - score-job
verification:
  - each job has a stable glassdoor:<posting id> or is routed to review
  - full description captured before scoring
  - apply flow chosen from the observed button (in-page vs external) with a snapshot
---
# Glassdoor playbook

## When to Use & Preconditions

Use only for Glassdoor; grouped guidance lives in the board-family playbooks.

- **Load when:** target.platform == glassdoor; job URL on Glassdoor.
- **Preconditions (stop if any is false):**
  - run lock owned, preflight exit 0, auth verified, context loaded (daily-run steps 1-3)
  - Glassdoor target enabled in context/targets.yaml
- **Requires skills:** `discover-jobs`, `score-job`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

Preconditions: AGENTS.md, successful preflight/auth/context loading, fresh accessibility snapshots, platform terms permit automation. Never bypass bot defenses.

1. For auth_required:true, open the auth check URL and snapshot. Confirm a named account/menu, not merely absence of Sign in. Public boards with auth_required:false may be read logged-out; a new login/2FA wall stops the whole run.
2. Pace every navigation/click/type/select/upload by a random 3–9 seconds. Snapshot results; use roles/names/refs, not CSS selectors.
3. Snapshot Jobs results and role links; record jobListingId from the detail URL. Distinguish employer application links from review/salary links. A forced review contribution or account gate is manual review, not permission to post.
4. Extract company, title, location, timestamp (unknown stays unknown), full description, canonical URL and glassdoor:<stable posting id>. If no reliable identifier exists, review; do not invent one. Limit collection to target.max_results; scroll small increments only when more results are needed.
5. Apply preferences filters and score-job.md. Read the existing journal before every application. Below 5 skipped; 5 to below 7 review; >=7 eligible subject to all safety gates.
6. Internal forms use apply-easy-apply.md. External redirects use apply-external-ats.md; inspect destination, snapshot and never guess an ATS. Unknown/account-gated flow is manual_apply + needs_review.
7. Upload only the owner-verified local resume via fill-form-answers.md. Missing/unknown answers, consent ambiguity or irreversible profile changes stop this application for review.
8. Any quick-apply button that may submit is a FINAL SUBMIT: reserve the job, validate/reload caps, verify all facts, and never click in dry run. Confirm receipt before marking applied. Uncertain receipt stays needs_review/submission_uncertain.
9. Local-first journal then idempotent Notion sync; stop immediately on CAPTCHA, 2FA, warning, rate limit or three consecutive errors; a mid-run login wall pauses per fill-form-answers.md Trap 5 and aborts if unresolved.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Treating the absence of "Sign in" as logged in → ✅ require a named account indicator when auth is required.
- ❌ Scrolling the whole list in one go → ✅ small increments, snapshot, stop at max_results.
- ❌ Clicking a quick-apply button during discovery → ✅ discovery never applies.

### Self-verification check (before reporting this step complete)
- [ ] each job has a stable glassdoor:<posting id> or is routed to review
- [ ] full description captured before scoring
- [ ] apply flow chosen from the observed button (in-page vs external) with a snapshot

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
