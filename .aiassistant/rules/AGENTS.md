# Job Hunter — JetBrains AI Assistant Rules

Read `AGENTS.md` and `skills/REGISTRY.md` first; load individual `skills/*.md` playbooks only when their trigger matches the current phase of work.

- `/setup` -> `skills/00-interrogate-and-onboard.md` + `skills/01-resume-ingestion.md`
- `/daily-run` or `/apply-url <url>` -> `skills/00-daily-run.md`
- `/tailor-cv <url>` -> `skills/03-tailor-resume-and-verify.md`
- `/weekly-report` -> `skills/06-log-and-insights.md`
- `/linkedin-growth` -> `skills/05-outreach-and-interview-prep.md`

Respect `dry_run: true`, zero hallucinated CV metrics, Days 1–3 warm-up caps (`5/day`), and explicit `APPROVE` confirmation before any Submit/Save/Send.
