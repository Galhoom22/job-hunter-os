# Skill: Daily Run (orchestrator) — v1

Trigger: "Start today's job run". Read `AGENTS.md` first. Includes partials:
`prompts/partials/pacing.md`, `snapshot-first.md`, `stop-conditions.md`.

## 0. Setup
- `RUN_ID = YYYY-MM-DD` (local date). Create `logs/runs/<RUN_ID>.json` per the `DailyRun` schema with `started_at`, empty `steps`.
- Load `config/guardrails.yaml`. Announce in chat: dry_run on/off, caps, min score.

## 1. Preflight
- Run `npm run preflight`. Non-zero exit → write `status: "aborted"`, report, stop.

## 2. Auth verification
For each platform in `context/targets.yaml` with `enabled: true`:
1. `browser_navigate` to the platform's `auth_check_url`.
2. `browser_snapshot`. Logged in if you see the account avatar / "Me" menu / no "Sign in" button.
3. Not logged in → mark platform `auth_failed`, skip it, tell the owner to log in (see `mcp/README.md`).

## 3. Load context
Read `context/profile.md`, `context/cv.md`, `context/preferences.yaml`, `context/form-answers.yaml`.
Load `logs/applications-log.json` and build `seen = set(job_id)`, `applied_today`, `applied_today_by_platform`.

## 4. Discover → 5. Score → 6. Apply loop
```
for target in enabled targets:
  jobs = run skills/discover-jobs.md(target)
  for job in jobs:
    if job.job_id in seen: continue                      # idempotency
    score = run skills/score-job.md(job)
    if score.match_score < min_match_score - 1: log skipped; continue
    if score.match_score < min_match_score: log needs_review; continue
    if applied_today >= max_applications_per_day: stop loop (cap reached)
    if applied_today_by_platform[p] >= max_per_platform[p]: skip platform
    if job.apply_type == "easy_apply": run skills/apply-easy-apply.md
    else: run skills/apply-external-ats.md
    run skills/log-application.md(result)
    seen.add(job.job_id)
```
- `dry_run: true` → apply skills fill everything but **never click the final Submit**; status `dry_run`.

## 7. Report
- Finish `logs/runs/<RUN_ID>.json` (counts, errors, finished_at). Run `npm run validate:logs`.
- Create a "Daily Runs" row in Notion (see `log-application.md` → Notion sync).
- Chat report: scanned / applied / needs_review / skipped / errors, plus a list of `needs_review` jobs with links and the open questions.
