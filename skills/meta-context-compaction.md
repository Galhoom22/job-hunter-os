---
name: meta-context-compaction
version: "1.0.0"
description: Load when a long run has processed 3-5 applications since the last checkpoint, the conversation is getting long, or a new session must resume an interrupted run; writes and re-reads logs/runs/current-session-checkpoint.json so rules and progress survive context loss.
triggers:
  - long-run-memory-compaction
  - every 3-5 applications or 15 jobs processed
  - resuming a run in a new chat/session
requires_mcp:
  - none
preconditions:
  - an active run with an owned lock (or a checkpoint to resume from)
  - schemas/index.ts SessionCheckpoint contract available to npm run validate:logs
requires_skills:
  - log-application
verification:
  - logs/runs/current-session-checkpoint.json validates (npm run validate:logs exits 0)
  - checkpoint counts agree with logs/applications-log.json for this run_id
  - after compaction AGENTS.md hard guardrails and only the next phase's skill were re-read
---
# Long-run memory compaction

## When to Use & Preconditions

Use during long daily runs so the agent does not forget caps, approvals or which jobs are done, and when a run must resume after the chat was reset. The journal (`logs/applications-log.json`) is always the source of truth; the checkpoint is a compact cache and never authorizes anything.

- **Load when:** long-run-memory-compaction; every 3–5 applications or 15 jobs processed; resuming a run in a new chat/session.
- **Preconditions (stop if any is false):**
  - an active run with an owned lock (or a checkpoint to resume from)
  - the SessionCheckpoint contract is available to `npm run validate:logs`
- **Requires skills:** `log-application`. **MCP:** none.

## Deterministic Step-by-Step Execution

### A. Write a checkpoint
1. Finish the current atomic step first (never checkpoint between a reservation and its receipt check).
2. Recount from the journal for this `run_id`: applied, dry_run, needs_review, skipped, failed, unresolved `submission_uncertain` reservations.
3. Write `logs/runs/current-session-checkpoint.json` (one file, overwritten each time) with exactly these fields:

```json
{
  "kind": "session_checkpoint",
  "version": 1,
  "run_id": "2026-11-18",
  "updated_at": "2026-11-18T10:42:00Z",
  "phase": "applying",
  "workflow_mode": "batch_review_first",
  "dry_run": true,
  "approval_mode": "approve_before_submit",
  "lock_started_at": "2026-11-18T09:58:12Z",
  "caps": { "effective_daily_cap": 5, "applied_today": 2, "reserved_unresolved": 0, "per_platform_applied": { "linkedin": 2 } },
  "processed_job_ids": ["linkedin:4012", "linkedin:4013"],
  "queue": ["greenhouse:acme-77"],
  "awaiting_owner": [{ "job_id": "linkedin:4015", "question": "Notice period in weeks?" }],
  "batch_selection": "APPLY 1,3",
  "consecutive_errors": 0,
  "next_action": "Open greenhouse:acme-77 from its folder logs/resumes/acme-backend-greenhouse-acme-77/",
  "notes": ""
}
```

   - `phase`: one of `readiness`, `discovery`, `triage`, `awaiting_owner`, `applying`, `logging`, `reporting`, `finished`, `aborted`.
   - Never store tokens, cookies, passwords, the lock owner token, form answers, salary or contact data. `lock_started_at` lets a resumed session confirm the lock in `logs/run.lock` is this run's lock.
4. Run `npm run validate:logs`; fix the checkpoint until it passes.
5. **Compact:** in your own working memory keep only: the checkpoint, AGENTS.md hard guardrails, the REGISTRY row for the next phase. Re-read AGENTS.md "Hard guardrails" and the single skill needed next (progressive disclosure). Drop earlier job descriptions and snapshots from consideration.

### B. Resume from a checkpoint (new session or after memory loss)
1. Read AGENTS.md, skills/REGISTRY.md, then the checkpoint.
2. If `phase` is `finished` or `aborted`, do not resume; start a new run normally.
3. Verify `logs/run.lock` exists and its `started_at` equals `lock_started_at`. If not, the run is not yours: stop and report. If yours, recover the owner token from the lock file only for journal/release calls.
4. Re-derive counts from the journal; if they disagree with the checkpoint, the journal wins — rewrite the checkpoint.
5. Re-run auth verification (daily-run step 2) and recompute the effective cap; time may have passed.
6. Any approval given before the interruption is EXPIRED (approval-gate.md). `batch_selection` survives only within the same `run_id` and only for jobs still in `queue`; re-check each job_id in the journal before opening it.
7. Continue from `next_action`.

### C. End of run
Set `phase` to `finished` (or `aborted`) and validate. Do not delete the file; the next run overwrites it.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Trusting the checkpoint's `applied_today` over the journal → ✅ the journal always wins.
- ❌ Saving the lock token or a session cookie "to make resuming easier" → ✅ only `lock_started_at`; tokens are re-read from the lock file.
- ❌ Resuming and submitting with an APPROVE given before the reset → ✅ show the summary again and wait.
- ❌ Checkpointing right after the Submit click, before checking the receipt → ✅ finish meta-self-verification first.
- ❌ Reloading every playbook after compaction → ✅ AGENTS.md guardrails + the one skill for the next phase.

### Self-verification check (before reporting this step complete)
- [ ] logs/runs/current-session-checkpoint.json validates (npm run validate:logs exits 0)
- [ ] checkpoint counts agree with logs/applications-log.json for this run_id
- [ ] after compaction AGENTS.md hard guardrails and only the next phase's skill were re-read
