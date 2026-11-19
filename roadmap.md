# Repository Readiness & Architecture Roadmap

## Completed Foundations
- [x] **Markdown-First + Zero-Dependency Node.js CLI Architecture:** Strictly `"dependencies": {}` and `"devDependencies": {}` in `package.json`; no web frameworks, backend servers, databases, or browser extensions.
- [x] **48 Consolidated Skills with Progressive Disclosure:** `30` core/career-ops playbooks (`00`–`26`, `linkedin-growth.md`, `fallback-no-mcp.md`), `4` `meta-*` reliability skills, `7` platform playbooks, and `7` ATS engine playbooks indexed in `skills/REGISTRY.md` and `skills/skills-manifest.json`.
- [x] **Fast-Start Onboarding Separation:** Distinct `/demo` (synthetic instant sandbox), `/quick-tailor` (1 CV + 1 JD, no browser login), and optional `/setup` + `/daily-run` (full browser-assisted workflow).
- [x] **Deterministic CLI Guardrails & Fixture Harness:** `audit`, `proof`, `eval --baseline` / `--file`, `pre-submit`, `doctor`, `backup`, `unlock`, and cross-OS GitHub Actions validation (`.github/workflows/validate-repo.yml`).
- [x] **25+ AI IDE & CLI Entrypoints:** Native rules/workflows/skills plus 6 model tuning guides (`adapters/models/`).

## Community & Ongoing Priorities
- [ ] Expand fixture-verified ATS mocks (`evals/fixtures/forms/`) beyond Greenhouse, Lever, and Ashby.
- [ ] Verify community-contributed regional job-board playbooks (GulfTalent, Naukri, StepStone, APAC/LATAM boards).
- [ ] Validate additional AI IDE / CLI harness integrations across macOS, Linux, and Windows.
- [ ] Optional owner-configured live-run setup (`skills/00-interrogate-and-onboard.md`) and optional Notion MCP sync (`skills/06-log-and-insights.md`).
