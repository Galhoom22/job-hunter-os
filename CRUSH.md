# Job Hunter — Charm Crush CLI Instructions

Read `AGENTS.md` and `skills/REGISTRY.md` first; load individual `skills/*.md` playbooks only when their trigger matches the active phase of work.

This is a **100% zero-code Markdown skills + Playwright/Notion MCP repository**:
- `/setup` -> `skills/00-interrogate-and-onboard.md` + `skills/01-resume-ingestion.md`
- `/daily-run` or `/apply-url <url>` -> `skills/00-daily-run.md`
- `/tailor-cv <url>` -> `skills/03-tailor-resume-and-verify.md`
- `/weekly-report` -> `skills/06-log-and-insights.md`
- `/linkedin-growth` -> `skills/05-outreach-and-interview-prep.md`

Configure Playwright MCP from `mcp/mcp.template.json`. Respect `dry_run: true`, verified facts only, and explicit owner `APPROVE` before any Submit/Save/Send.
