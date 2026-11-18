# Job Hunter — Gemini CLI & Antigravity

Read [AGENTS.md](./AGENTS.md) and [skills/REGISTRY.md](./skills/REGISTRY.md) first; only load a full skill body when its trigger matches the current phase of work.

This is a **100% zero-code Markdown skills + Playwright/Notion MCP repository**. Execute workflows directly using your file tools, Playwright MCP, and optional Notion MCP:
- `/setup` or "Check my folder" -> `skills/00-interrogate-and-onboard.md` + `skills/01-resume-ingestion.md`
- `/daily-run` or `/apply-url <url>` -> `skills/00-daily-run.md`
- `/tailor-cv <url>` -> `skills/03-tailor-resume-and-verify.md`
- `/weekly-report` -> `skills/06-log-and-insights.md`
- `/linkedin-growth` -> `skills/05-outreach-and-interview-prep.md`
- Persona switch -> `skills/07-persona-switcher.md`
- 7-day follow-up -> `skills/08-follow-up-radar.md`
- Offer negotiation -> `skills/09-offer-negotiator.md`

See `adapters/models/gemini.md` for Gemini-specific multimodal & snapshot verification guidance. Respect `dry_run: true`, verified facts only, caps, and explicit `APPROVE` gates.
