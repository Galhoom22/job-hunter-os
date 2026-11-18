# Repository audit — 2026-11-18

## Outcome
Repository safety and portability upgraded; NOT certified 100% production-ready. No real application or Notion synchronization was performed. No background scheduler or universally compatible IDE runner was installed. Playbooks cannot guarantee changing platform interfaces or permit automation where platform terms prohibit it.

## Verified
- 40 tests pass: routing, YAML editing, caps, exact score routing, unknown answers, dry-run, manual fallback, reservation caps, privacy and analytics.
- Real and synthetic JSON validation passed.
- Preview build log reports build OK; no manual build invoked.
- All five dashboard pages render; no browser page errors. Turning dry run off with unverified answers is rejected and stays ON.
- Mobile applications view checked; table scrolls for remaining columns.
- Preflight correctly refuses synthetic facts, unverified answers, disabled targets, missing Notion IDs/config and missing browser profile. MCP generation refuses missing token without printing secrets.
- Private context and logs untracked but preserved locally. Previous commits are not erased; examples previously committed were synthetic.

## Live-run prerequisites / unverified checks
Owner-confirmed profile, CV, legal/form answers and real resume PDF; Notion token + three shared database IDs; authorized persistent platform login; approved enabled targets and a permitted local agent/MCP environment. Browser resume upload, live receipt confirmation, Notion upsert/retry/read-back and full unattended runs remain UNVERIFIED. Complete a real dry run before disabling dry_run. Never promise all IDEs run indefinitely without testing each actual version and permissions.

## Additions
- `.clinerules`
- `.github/copilot-instructions.md`
- `.windsurfrules`
- `demo/applications-log.json`
- `demo/form-answers.yaml`
- `demo/guardrails.yaml`
- `demo/insights/monthly-2026-11.json`
- `demo/insights/weekly-2026-W46.json`
- `demo/runs/2026-10-28.json`
- `demo/runs/2026-10-29.json`
- `demo/runs/2026-10-30.json`
- `demo/runs/2026-10-31.json`
- `demo/runs/2026-11-01.json`
- `demo/runs/2026-11-02.json`
- `demo/runs/2026-11-03.json`
- `demo/runs/2026-11-04.json`
- `demo/runs/2026-11-05.json`
- `demo/runs/2026-11-06.json`
- `demo/runs/2026-11-07.json`
- `demo/runs/2026-11-08.json`
- `demo/runs/2026-11-09.json`
- `demo/runs/2026-11-10.json`
- `demo/runs/2026-11-11.json`
- `demo/runs/2026-11-12.json`
- `demo/runs/2026-11-13.json`
- `demo/runs/2026-11-14.json`
- `demo/runs/2026-11-15.json`
- `demo/runs/2026-11-16.json`
- `demo/runs/2026-11-17.json`
- `demo/targets.yaml`
- `docs/execution-safety.md`
- `roadmap.md`
- `schemas/analytics.ts`
- `scripts/insights.ts`
- `scripts/journal.ts`
- `scripts/run-lock.ts`
- `skills/ats/ashby.md`
- `skills/ats/breezyhr.md`
- `skills/ats/greenhouse.md`
- `skills/ats/lever.md`
- `skills/ats/smartrecruiters.md`
- `skills/ats/taleo.md`
- `skills/ats/workday.md`
- `skills/platforms/bayt.md`
- `skills/platforms/builtin.md`
- `skills/platforms/dice.md`
- `skills/platforms/glassdoor.md`
- `skills/platforms/indeed.md`
- `skills/platforms/linkedin.md`
- `skills/platforms/remoteok.md`
- `skills/platforms/welcometothejungle.md`
- `skills/platforms/wellfound.md`
- `skills/platforms/weworkremotely.md`
- `skills/platforms/wuzzuf.md`
- `skills/platforms/ziprecruiter.md`
- `src/test/analytics.test.ts`
- `src/test/privacy.test.ts`
- `src/test/submission-safety.test.ts`

## Upgraded or untracked files
- `.agent/workflows/daily-run.md`
- `.gitignore`
- `AGENTS.md`
- `README.md`
- `config/guardrails.yaml`
- `context/cv.md` — untracked, retained privately on disk
- `context/form-answers.yaml` — untracked, retained privately on disk
- `context/form-answers.yaml.example`
- `context/preferences.yaml` — untracked, retained privately on disk
- `context/profile.md` — untracked, retained privately on disk
- `context/targets.yaml` — untracked, retained privately on disk
- `context/targets.yaml.example`
- `logs/applications-log.json` — untracked, retained privately on disk
- `logs/insights/monthly-2026-11.json` — untracked, retained privately on disk
- `logs/insights/weekly-2026-W46.json` — untracked, retained privately on disk
- `logs/runs/2026-10-28.json` — untracked, retained privately on disk
- `logs/runs/2026-10-29.json` — untracked, retained privately on disk
- `logs/runs/2026-10-30.json` — untracked, retained privately on disk
- `logs/runs/2026-10-31.json` — untracked, retained privately on disk
- `logs/runs/2026-11-01.json` — untracked, retained privately on disk
- `logs/runs/2026-11-02.json` — untracked, retained privately on disk
- `logs/runs/2026-11-03.json` — untracked, retained privately on disk
- `logs/runs/2026-11-04.json` — untracked, retained privately on disk
- `logs/runs/2026-11-05.json` — untracked, retained privately on disk
- `logs/runs/2026-11-06.json` — untracked, retained privately on disk
- `logs/runs/2026-11-07.json` — untracked, retained privately on disk
- `logs/runs/2026-11-08.json` — untracked, retained privately on disk
- `logs/runs/2026-11-09.json` — untracked, retained privately on disk
- `logs/runs/2026-11-10.json` — untracked, retained privately on disk
- `logs/runs/2026-11-11.json` — untracked, retained privately on disk
- `logs/runs/2026-11-12.json` — untracked, retained privately on disk
- `logs/runs/2026-11-13.json` — untracked, retained privately on disk
- `logs/runs/2026-11-14.json` — untracked, retained privately on disk
- `logs/runs/2026-11-15.json` — untracked, retained privately on disk
- `logs/runs/2026-11-16.json` — untracked, retained privately on disk
- `logs/runs/2026-11-17.json` — untracked, retained privately on disk
- `logs/screenshots/.gitkeep` — untracked, retained privately on disk
- `mcp/README.md`
- `package.json`
- `prompts/partials/pacing.md`
- `prompts/partials/stop-conditions.md`
- `schemas/index.ts`
- `scripts/preflight.ts`
- `scripts/sync-mcp.ts`
- `scripts/validate-logs.ts`
- `skills/00-daily-run.md`
- `skills/apply-easy-apply.md`
- `skills/apply-external-ats.md`
- `skills/discover-jobs.md`
- `skills/fill-form-answers.md`
- `skills/log-application.md`
- `skills/score-job.md`
- `skills/weekly-insights.md`
- `src/lib/repo-data.functions.ts`
- `src/lib/stats.ts`
- `src/routes/applications.tsx`
- `src/routes/runs.tsx`
- `src/test/guardrails.test.ts`

Public synthetic log/run/insight copies are in demo/; private data is never bundled in production. Original MCP template already meets requested persistent-browser and Notion settings and remains unchanged. Existing Claude/Cursor pointers remain canonical.
