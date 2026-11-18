# Repository readiness audit

## Zero-code Markdown skills & MCP architecture
- [x] Purged custom CLI (`bin/`), runtime scripts (`scripts/`), Chrome extension (`extension/`), TypeScript policy code (`schemas/*.ts`), and dashboard bloat.
- [x] Consolidated core workflows into pure-Markdown `skills/00-interrogate-and-onboard.md` through `skills/06-log-and-insights.md` + `skills/00-daily-run.md` (with zero external scripts required).
- [x] Standardized YAML frontmatter and three mandatory sections across all 35 skills (`core`, `meta`, `platforms`, `ats`) and generated `skills/REGISTRY.md` + `skills/skills-manifest.json` for Progressive Disclosure.
- [x] Updated `AGENTS.md`, IDE entrypoints, `.agent/workflows/`, `commands/`, `README.md`, and `docs/repository-audit.md` for copy-paste / `git clone` zero-code setup and MCP connection.

## Live-run prerequisites (owner-controlled in chat)
- [ ] Owner-verified CV/profile, targets, legal/EEO answers, and headed Playwright MCP sessions (`skills/00-interrogate-and-onboard.md`).
- [ ] Optional Notion MCP connection and database setup (`skills/06-log-and-insights.md`).
