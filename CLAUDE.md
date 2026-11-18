# Job Hunter — Claude Code

Read [AGENTS.md](./AGENTS.md) and [skills/REGISTRY.md](./skills/REGISTRY.md) first; only load a full skill body when its trigger matches the current phase of work.

This is a **zero-code Markdown skills + Playwright/Notion MCP repository**. You execute workflows directly using your file tools and MCP tools:
- `/setup` or "Check my folder" -> `skills/00-interrogate-and-onboard.md` + `skills/01-resume-ingestion.md`
- `/daily-run` or `/apply-url <url>` -> `skills/00-daily-run.md` (Step 0 `00-interrogate-and-onboard.md` -> `02` -> `03` -> `04` -> `05` -> `06`)
- `/tailor-cv <url>` -> `skills/03-tailor-resume-and-verify.md` (never submits)
- `/weekly-report` -> `skills/06-log-and-insights.md`
- `/linkedin-growth` -> `skills/05-outreach-and-interview-prep.md` (draft-only until explicit `approve`)

Connect MCP using `mcp/mcp.template.json` (persistent `./browser-profile` for Playwright; optional `NOTION_TOKEN` for Notion). Local JSON under `logs/` is primary. Never invent facts, bypass challenges, or submit without gate checks.
