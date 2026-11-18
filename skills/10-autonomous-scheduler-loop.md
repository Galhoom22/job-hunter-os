---
name: autonomous-scheduler-loop
version: "1.0.0"
description: Load when running a recurring /loop or scheduled job-hunting trigger (Cursor, Claude Code, OpenClaw, cron) so discovery, ghost filtering, and CV prep run strictly inside active_hours while respecting warm-up caps and pausing at approve_before_submit.
triggers:
  - /loop daily-run
  - scheduled job discovery
  - recurring OpenClaw / cron job hunt
requires_mcp:
  - playwright
preconditions:
  - all 5 readiness gates pass in context/ with zero placeholders
  - current local time is inside active_hours in config/guardrails.yaml
requires_skills:
  - interrogate-and-onboard
  - discover-and-triage
  - tailor-resume-and-verify
  - fill-and-apply
  - log-and-insights
  - meta-context-compaction
verification:
  - active_hours, Days 1-3 warm-up cap (<=5/day), and max_per_platform were verified before any action
  - scheduled run stopped cleanly at the Mission Control table or approve_before_submit without bypassing owner APPROVE
  - logs/runs/current-session-checkpoint.json and logs/runs/YYYY-MM-DD.json reflect the latest loop state
---
# Autonomous Scheduler & `/loop` Runner

## When to Use & Preconditions

Use when an IDE or harness triggers recurring checks (`/loop`, Claude Code/Cursor schedules, OpenClaw, or Hermes) for job discovery and preparation. Scheduled loops prepare batches and flag high-match roles—they never override `dry_run` or `approve_before_submit`.

- **Load when:** `/loop daily-run`; scheduled job discovery; recurring OpenClaw / cron job hunt.
- **Preconditions (stop if any is false):**
  - all 5 readiness gates pass in `context/` with zero placeholders
  - current local time is inside `active_hours` in `config/guardrails.yaml`
- **Requires skills:** `interrogate-and-onboard`, `discover-and-triage`, `tailor-resume-and-verify`, `fill-and-apply`, `log-and-insights`, `meta-context-compaction`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

1. **Enforce Time Window & Caps First:**
   - Read `config/guardrails.yaml` (`active_hours`, `warmup_mode`, `max_applications_per_day`, `max_per_platform`, `dry_run`, `approval_mode`).
   - If the current time in the owner's timezone is outside `active_hours`, exit immediately without opening any browser tab.
   - Count `applied` + unresolved `submission_uncertain` entries in `logs/applications-log.json` for today (UTC) and check the Days 1–3 warm-up cap (`max 5/day` across the first 3 distinct non-aborted run dates in `logs/runs/`). If the cap is reached, stop cleanly.
2. **Audit Readiness & Browser Auth:**
   - Re-verify `context/` has zero placeholders (`skills/00-interrogate-and-onboard.md`). If incomplete, log `aborted` (reason `incomplete_readiness`) and alert the owner—never loop on incomplete facts.
   - Verify logged-in state on each enabled target's `auth_check_url` via Playwright MCP. Any CAPTCHA, 2FA, login wall, rate limit, or account warning aborts immediately.
3. **Run Discovery, Ghost Check & Tier A Tailoring:**
   - Execute `skills/02-discover-and-triage.md` Phase 1 (deduplicate against `logs/applications-log.json` and `logs/skipped-jobs.json`, expand full JDs, filter `ghost_or_expired`, score `0–10`).
   - For new **Tier A (`8–10`)** roles, pre-generate fact-checked, humanized resumes (`skills/03-tailor-resume-and-verify.md`) and `interview-dossier.md` + `outreach-draft.md` (`skills/05-outreach-and-interview-prep.md`).
4. **Pause at Owner Consent Gates:**
   - Under `workflow_mode: batch_review_first` (default) or `approve_before_submit`, present the **Mission Control Table** and **STOP**—wait for the owner's `APPLY ALL GREEN` / `APPLY 1,3` and per-job `APPROVE` replies in chat.
   - Save progress to `logs/runs/current-session-checkpoint.json` (`skills/meta-context-compaction.md`) and update `logs/runs/YYYY-MM-DD.json`.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Allowing a background `/loop` to click Submit when `approve_before_submit` or `dry_run: true` is active → ✅ prepare Tier A folders and pause for owner `APPROVE`.
- ❌ Running browser actions at 3:00 AM outside `active_hours` → ✅ enforce `active_hours` before every loop tick.
- ❌ Retrying a CAPTCHA or login wall on the next loop tick → ✅ abort and notify the owner immediately.

### Self-verification check (before reporting this step complete)
- [ ] `active_hours`, Days 1–3 warm-up cap (`<= 5/day`), and `max_per_platform` were verified before any action
- [ ] scheduled run stopped cleanly at the Mission Control table or `approve_before_submit` without bypassing owner `APPROVE`
- [ ] `logs/runs/current-session-checkpoint.json` and `logs/runs/YYYY-MM-DD.json` reflect the latest loop state
