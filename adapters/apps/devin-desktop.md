# Devin Desktop (formerly Windsurf) Adapter

`job-hunter-os` natively supports **Cognition Devin Desktop** (including ACP workflows and `.agents/skills/` auto-discovery) as well as legacy **Windsurf** via `.windsurfrules`.

## Setup in Devin Desktop
1. Open the cloned `job-hunter-os/` folder in Devin Desktop.
2. Devin Desktop automatically loads `.windsurfrules`, `AGENTS.md`, and `.agents/skills/*/SKILL.md`.
3. Add the Playwright MCP and optional Notion MCP definitions from `mcp/mcp.template.json` into your Devin Desktop / ACP MCP configuration (keeping `--user-data-dir=./browser-profile` pointed to your local repository path).
4. Start in chat with `/setup` (or `"Read AGENTS.md and set up my profile"`).

## Safety Rules
- Keep `dry_run: true` until your first full run is verified.
- Never approve unattended form submissions without reviewing the Mission Control table (`skills/02-discover-and-triage.md`) and `APPROVE` gate (`skills/04-fill-and-apply.md`).
