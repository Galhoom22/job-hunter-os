---
name: approval-gate
version: "1.1.0"
description: Load immediately before any irreversible Apply/Submit click in any channel (MCP, extension, manual) to enforce job-bound owner approval and the configured approval_mode.
triggers:
  - about to click Submit / Send application
  - one-click or quick apply button
  - APPROVE / EDIT / SKIP reply
requires_mcp:
  - none
preconditions:
  - form fully prepared with verified answers and the exact per-job file
  - applicationDecision inputs (logs, caps, approval_mode) freshly re-read
requires_skills:
  - log-application
verification:
  - approval (when required) was an exact APPROVE for this job after the latest form state was shown
  - no edit, navigation or new question happened after APPROVE
  - reservation entry written and validated before the click; dry run never reaches the click
---
# Approval gate — safety always wins

## When to Use & Preconditions

Use for every final action. Profile edits, posts and outreach have their own exact-text approvals.

- **Load when:** about to click Submit / Send application; one-click or quick apply button; APPROVE / EDIT / SKIP reply.
- **Preconditions (stop if any is false):**
  - form fully prepared with verified answers and the exact per-job file
  - applicationDecision inputs (logs, caps, approval_mode) freshly re-read
- **Requires skills:** `log-application`. **MCP:** none.

## Deterministic Step-by-Step Execution

After readiness + fresh run consent + preflight/auth/context, prepare an eligible job's exact reviewed form/PDF. Immediately before any irreversible Apply/Submit click, evaluate applicationDecision with current logs/caps, approval_mode and job-bound approval/has_essay flags. Early preparation may proceed on approval_required; it is NOT submit permission. One-click apply also requires this gate before its first click.

| Mode | Final action |
|---|---|
| approve_before_submit (default) | Show summary and wait for exact APPROVE for this job and these answers |
| auto_high_confidence | Score >=8, zero unknown questions, no filled essay/open-ended motivation question: eligible only after all other gates. Scores 7..<8 or any filled essay need explicit approval. Score 6 remains needs_review under minimum 7, never submit even with approval. |
| dry_run | No final click, no submission reservation; verification screenshot and dry_run journal only |

Legacy dry_run:true overrides ALL modes and approvals. A higher min_match_score still applies; do not lower it to accommodate score 6. Profile changes/posts are NEVER covered by auto_high_confidence.

Show company, role, canonical job URL/ID, score and gaps, exact tailored PDF path/upload filename, every filled answer/consent and mode. Ask: **Reply APPROVE to submit this exact application, EDIT <field> to revise, or SKIP.** Unknown facts require owner verification first. APPROVE expires after edits, navigation/form changes, new questions, changed resume, run interruption or stale session. Never reuse approval for another job or infer it from mission-briefing consent. EDIT requires fact confirmation, refill, resnapshot and a new summary/approval; SKIP records skipped and does not click.

Once approved, recheck active hours, permissions, lock, fresh auth, caps (including pending reservations), exact PDF and duplicates. Reserve locally, validate, Submit once, verify job-identifiable receipt and update same record. Ambiguity stays needs_review/submission_uncertain, never retries. CAPTCHA/2FA/warnings abort. Waiting for chat means no background operation; release owned lock on interruption and revalidate on a new run.

Extension mode is ALWAYS human-approved, even if its payload says auto_high_confidence. It cannot inspect local readiness/logs/caps, upload resumes or guarantee receipts: owner must check them, record the result locally and never claim the extension verified them. Dry run and unknown-question rules still block its Submit button.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Reusing yesterday's APPROVE for a similar job → ✅ approval is bound to one job and one form state.
- ❌ Submitting a score-6 job because the owner said approve → ✅ below min_match_score it stays needs_review.
- ❌ Letting auto_high_confidence submit a filled essay → ✅ essays always need explicit approval.

### Self-verification check (before reporting this step complete)
- [ ] approval (when required) was an exact APPROVE for this job after the latest form state was shown
- [ ] no edit, navigation or new question happened after APPROVE
- [ ] reservation entry written and validated before the click; dry run never reaches the click

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
