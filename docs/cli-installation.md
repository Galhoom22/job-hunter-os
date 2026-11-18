# Local/global CLI installation and compatibility

`bin/job-hunter.mjs` uses Node built-ins only (Node 18+). The distributed package has no production dependencies. Development dependencies preserve the existing preview/tests and are not part of CLI execution. Git-sourced npx may still fetch Git/npm metadata; “zero dependency” is not offline, zero-download, or a 30-second performance guarantee. No prepare/install/build hooks are needed.

## Agent-home resolution
- `init` always scaffolds the current directory, preserving existing files.
- `init --global` / `-g` scaffolds `~/.job-hunter-os`.
- Other commands prefer an installed current directory (marker `.job-hunter-install.json`), otherwise the installed global home; `--global` selects global explicitly.
- Global commands embed the absolute agent-home path. All context, browser sessions, helper cwd, reports and logs use it, never an unrelated active project. Do not run two agents against its single profile.

The installer creates skills/context/config/templates/docs/prompts/commands/mcp, assets, private logs and browser-profile. Context starts from synthetic `.example` structures and must be replaced/verified in chat. It never overwrites an existing CV, profile, playbook, rule, command, package.json or journal. Re-running init is additive, not an automatic upgrade. Resolve changed files manually after review.

## IDE paths and caveats
| Target | Local / global output | Status |
|---|---|---|
| Claude Code commands | `.claude/commands/*.md` / `~/.claude/commands/*.md` | Six command files; namespace/legacy `/user:` and `/project:` aliases depend on version |
| Claude MCP | `.mcp.json` / `~/.claude.json` plus agent-home `.mcp.json` | JSON mcpServers merge preserves other settings |
| Cursor MCP/rule | `.cursor/mcp.json`, `.cursor/rules/job-hunter.mdc` / under `~/.cursor/` | Global rule discovery differs by version; import the pointer into supported user rules if needed |
| Antigravity | local `.agent/workflows/`; global `~/.antigravity/workflows/`; MCP `~/.gemini/antigravity/mcp_config.json` | Proposed workflow location is not universally auto-discovered; import using your version's supported workflow settings |
| Windsurf | `.windsurf/workflows/`; global `~/.windsurf/workflows/`, `~/.windsurf/rules/`; MCP `~/.codeium/windsurf/mcp_config.json` | Verify supported workflow/rule discovery for your version |
| Cline | private `mcp/cline.import.json`; global `~/.clinerules/job-hunter.md` pointer | Explicit MCP import required; VS Code profile/extension storage paths are not guessed or overwritten |

Local init also writes user-level Antigravity/Windsurf MCP locations because these clients use user settings. Existing same-name Playwright server with a different definition causes a conflict and is preserved, not hijacked; rename/reconcile it explicitly. Unrelated servers (including existing Notion) remain intact. JSONC/invalid shapes are rejected rather than destructively parsed. All configs are parsed before MCP writes; unexpected permission/disk failures can still leave partial output. Prior configs are backed up privately before changes. Backups may contain secrets—never publish them.

Notion is opt-in: `mcp/notion.import.json` stages a token-placeholder definition from the canonical template, not your token. Authorize your chosen IDE's secure env/connection mechanism and follow setup-notion.md. CLI never propagates NOTION_TOKEN into new configs or enables the adapter automatically. Doctor only reports presence, never its value or live access.

## Helpers and first real run
Scaffolding needs no dependency install. Existing application safety helpers use TypeScript/Zod/YAML/Playwright separately. In an empty/global home the installer creates a small private runtime package; allow your agent to run `npm install` there during /setup if using those helpers. This is not a hosted backend.

In an existing project, package.json is preserved. `.job-hunter-runtime.json` records required helper commands. With owner permission add those scripts/dependencies locally, or use a dedicated global home; never blindly run an unrelated project's `preflight` script or overwrite its manifest. Existing helpers use modern Node features: **Node 22+ is required for those helpers**, despite the installation CLI supporting Node 18+. Do not disable required preflight/validation because tooling is missing. Doctor is a structural diagnostic only, returns 1 for incomplete readiness and 0 when all checks pass; it is not application authorization.

`login` opens installed Chrome/Chromium with the same dedicated user-data directory and four manual login tabs. Browser installation is not silently performed. CLI Chrome and Playwright MCP Chromium may have different browser versions: close Chrome before MCP and verify compatibility/login in /setup; never downgrade an incompatible profile blindly. Missing browser → use headed MCP setup. It does not read credentials, solve challenges or prove sessions valid. macOS/Windows actual IDE discovery and interactive login require testing on your machine.

`add-platform SLUG` adds a disabled `other` target (cap 0) and a template playbook. `https://example.invalid/` is explicitly a placeholder awaiting the owner's real URL, not a working board. Simple block-style target YAML is supported; complex YAML requires agent review. No new adapter or automatic permission to submit is created.

## Transparent installers
Review scripts/install.sh or scripts/install.ps1 before piping remote content into a shell. They clone a separate `~/.job-hunter-os-source` installer checkout, then create the private runtime in `~/.job-hunter-os`; no sudo, shell profile edits or automatic Git updates. Existing source checkout is preserved. Use a fresh reviewed checkout to upgrade; private runtime files remain untouched. This separation prevents installing a repository over personal context/browser data. Hosted raw GitHub availability and public visibility are prerequisites, not verified by local tests.
