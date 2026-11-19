# Google Gemini CLI & GitHub Copilot / VS Code Adapter

`job-hunter-os` supports **Google Gemini CLI** and **GitHub Copilot / VS Code** locally and globally without heavy dependencies.

## 1. Google Gemini CLI
Run:
```bash
npx github:redasalem/job-hunter-os init --global --ide gemini
```
What gets configured automatically:
1. User skills in `~/.gemini/skills/` (preserving any custom skills unless `--force` is passed).
2. A non-destructive managed section (`<!-- job-hunter-os:start -->`) in `~/.gemini/GEMINI.md` pointing to `~/.job-hunter-os/AGENTS.md` and `skills/REGISTRY.md`.
3. `mcpServers.playwright` (and optional `notion` when `NOTION_TOKEN` is set) merged safely into `~/.gemini/settings.json` (global) or `.gemini/settings.json` (local, gitignored).

Inside a local project, Gemini CLI also natively discovers root [`GEMINI.md`](../../GEMINI.md) and `.agents/skills/*/SKILL.md`. See [`adapters/models/gemini.md`](../models/gemini.md) for Gemini model tuning.

## 2. GitHub Copilot & VS Code
Run:
```bash
npx github:redasalem/job-hunter-os init --ide copilot
# or globally for Copilot CLI:
npx github:redasalem/job-hunter-os init --global --ide copilot
```
- **Local workspace:** Copies [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md), `.github/prompts/`, and `.agents/skills/`, and writes gitignored `.vscode/mcp.json` using VS Code's native top-level `"servers"` schema (`"type": "stdio"`).
- **Global Copilot CLI:** Installs `~/.agents/skills/`, adds a managed block to `~/.copilot/copilot-instructions.md`, and merges Playwright MCP into `~/.copilot/mcp-config.json` (`"mcpServers"` format).
