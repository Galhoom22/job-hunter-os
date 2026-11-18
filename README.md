# Autonomous AI Job Hunter (portable, zero-backend)

Clone this repo and open it in **Antigravity**, **Cursor** or **Claude Code**. Then say *"Start today's job run"*.

- **Brain:** `AGENTS.md` + `skills/*.md` (pointers: `CLAUDE.md`, `.cursor/rules/`, `.agent/workflows/`)
- **Hands:** Playwright MCP with a persistent local browser profile (`browser-profile/`, gitignored)
- **Memory:** Notion MCP + `logs/*.json` (validated by `schemas/index.ts`)
- **Dashboard:** `npm run dev` → http://localhost:8080 (Overview, Applications, Runs, Insights, Config)

## Quick start
```bash
npm install
cp .env.example .env            # add NOTION_TOKEN
npm run sync:mcp                # generates .mcp.json + .cursor/mcp.json
# fill in context/*.md / *.yaml (templates in *.example), put your CV PDF at context/resume.pdf
npm run preflight
npm run dev                     # dashboard
```
Log in once to LinkedIn and Google in the agent's browser — see `mcp/README.md`.
`config/guardrails.yaml` ships with `dry_run: true`. Only disable it after verified owner facts and a successful live dry run.

## Scripts
| Command | What it does |
|---|---|
| `npm run sync:mcp` | Template → IDE MCP configs |
| `npm run validate:logs` | Schema + duplicate check of everything in `logs/` |
| `npm run preflight` | Files, MCP config, caps, and log validity before a run |
| `npm test` | Guardrail rule tests |

`demo/` contains public synthetic data. Initialize private `logs/` to empty before your first real run; privacy exclusions are already active.

## Readiness & privacy (audit update)

Real context/history, resume PDFs, browser profile and generated MCP configs are ignored and untracked. Public synthetic data lives in `demo/` only; published dashboards are read-only demo views, never personal-history hosts. Local editing is development-only. Git history still contains earlier synthetic examples; ignoring does not remove history.

Fresh local setup:
1. Copy context/*.example to the corresponding real filenames. Replace every synthetic contact/CV/legal/experience answer; set owner_verified:true ONLY after reviewing every fact.
2. Put your real PDF at assets/resume.pdf and set resume_pdf_path. Initialize logs/applications-log.json to [] (do not use demo as real history).
3. Set actual Notion database IDs in preferences and your token locally; generate MCP configs and complete headed platform login.
4. Enable only configured, permitted platform targets. All template targets start disabled. Set per-platform caps and retain dry_run:true for first end-to-end testing.
5. npm run preflight; npm run validate:logs; npm test. Follow AGENTS.md and docs/execution-safety.md. Run a real dry-run with verified sessions/Notion before enabling submissions.

Scoring: >=7 eligible, 5–6 review, <5 skipped. Eligibility is NOT authorization to submit: unknown facts, duplicate jobs, caps, complex ATS and uncertain receipts override it. Workday/Taleo use manual_apply + needs_review.

Headless: npm run sync:mcp -- --headless; then restart MCP tools. Keep an authorized local IDE/model process running; no hosted/background runner is installed by this audit. Check mcp/README.md for mode/session details.

See docs/repository-audit.md for the file-by-file upgrade inventory and unverified live-service checks.
