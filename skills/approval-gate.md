---
name: approval-gate
description: Enforce job-bound owner approval before irreversible submission across all execution channels.
---
# Approval gate — safety always wins

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
