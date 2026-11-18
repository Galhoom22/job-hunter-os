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
`config/guardrails.yaml` ships with `dry_run: true`. Switch it off on the Config page when you're ready.

## Scripts
| Command | What it does |
|---|---|
| `npm run sync:mcp` | Template → IDE MCP configs |
| `npm run validate:logs` | Schema + duplicate check of everything in `logs/` |
| `npm run preflight` | Files, MCP config, caps, and log validity before a run |
| `npm test` | Guardrail rule tests |

`logs/` contains demo data. Delete it before your first real run, and uncomment the privacy lines in `.gitignore`.
