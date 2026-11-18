# Repository readiness audit

## Zero-code Markdown skills & MCP architecture
- [x] Removed all custom CLI (`bin/`), runtime scripts (`scripts/`), Chrome extension (`extension/`), TypeScript schemas (`schemas/*.ts`), and web-app boilerplate (`vite.config.ts`, `src/`, `public/`, `tsconfig.json`, `package.json`, `bunfig.toml`).
- [x] Consolidated pure-Markdown workflows (`skills/00-daily-run.md`, `00-interrogate-and-onboard.md` through `09-offer-negotiator.md`, `fallback-no-mcp.md`, 4 `meta-*` skills, 16 platform playbooks, 7 ATS playbooks).
- [x] Standardized YAML frontmatter and three mandatory sections across all 39 skills and generated `skills/REGISTRY.md` + `skills/skills-manifest.json` for Progressive Disclosure.
- [x] Added universal native entrypoints across 15+ AI IDEs/CLIs/desktop apps and 4 model-specific tuning guides (`adapters/models/`).
- [x] Configured pure Linux/Python/Ruby GitHub Actions governance validation (`.github/workflows/validate-repo.yml`) with zero `npm install` or JS build steps.

## Live-run prerequisites (owner-controlled in chat)
- [ ] Owner-verified CV/profile, targets, legal/EEO answers, and headed Playwright MCP sessions (`skills/00-interrogate-and-onboard.md`).
- [ ] Optional Notion MCP connection and database setup (`skills/06-log-and-insights.md`).
