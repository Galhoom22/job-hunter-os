# Connect local MCP tools for chat-first job hunting

The canonical public definition is mcp/mcp.template.json. Playwright starts headed Chromium with `--user-data-dir=./browser-profile`; resolve this to the repository's absolute path in the IDE configuration. Cookies stay in this private local profile, never commit or share it. No web server is needed.

## Chat-first setup
Open the repo in your IDE and say “Setup my profile from this CV.” The agent follows skills/00-onboarding-chat.md and can prepare private settings with your local tool permission. No manual YAML editing is required. MCP installation/settings import or restart may still require your IDE's own UI approval.

If local helpers are desired, authorize the agent to run `npm install` and `npm run sync:mcp`. That generates gitignored `.mcp.json` for Claude Code and `.cursor/mcp.json` for Cursor from the template. Other IDE versions may need importing the server definitions into their supported settings; do not assume identical formats. Generated files substitute an absolute browser profile and optional NOTION_TOKEN privately, using JSON serialization and 0600 permissions where supported. Never print or commit them.

## Manual login once
1. Connect Playwright MCP in headed mode, then have the agent open only your chosen platform.
2. Enter credentials and complete any challenge yourself in the browser, not chat. The agent pauses and does not capture password/2FA screens or solve challenges.
3. Confirm you're done; the agent snapshots a named account/menu and records verification time, not secrets.
4. Later runs reverify auth. Unexpected login, CAPTCHA, 2FA, warnings or rate limits abort the run. Do not start two browsers against the same profile; never delete locks without the owner.

## Optional Notion
Default off. If desired, authorize Notion through your IDE's secure connector flow or put NOTION_TOKEN locally in ignored .env (never chat). Authorize a parent page and share it with the integration. Ask the agent to follow skills/setup-notion.md to discover capabilities, reuse/create the three trackers, test read-back and store real IDs privately. No mandatory Notion account or tracker; failed setup leaves local-only operation intact. Enabling Notion sync sends approved tracking fields to Notion.

## Capabilities and portability
Follow skills/mcp-capabilities.md. Actual tools must include snapshots, accessible interactions, waits, tabs, screenshots and uploads. PDF methods vary: use an exposed PDF tool only if present; otherwise approved local renderer/print or human fallback. Never invent browser_pdf or weaken local-file restrictions.

Native slash commands are IDE/version-dependent; docs/chat-commands.md supplies fallback prompts. Headless is not a scheduler. Closing your IDE/machine stops its agent; no unattended reliability claim.

Optional headless mode: close headed browser first, ask the agent to run `npm run sync:mcp -- --headless`, then restart MCP with the same absolute profile. Return to headed for human login. No stealth flags, anti-detection, challenge solving or consent bypass; 3–9-second waits, reading pauses, caps and cooldown limit load, not account-ban guarantees.

Template package versions should be reviewed/pinned to versions tested in your environment before operational upgrades. Tools and schemas can change. Permission failures/read-only tools are blockers, not a reason to fabricate success or IDs.

## Universal installer
Use `node bin/job-hunter.mjs init [--global]` and `sync-mcp [--global]` for additive, non-destructive config merges. They preserve unrelated settings and refuse differing same-name servers. Notion remains a separate token-placeholder import; Cline requires importing its private staging file. See [local/global paths and compatibility](../docs/cli-installation.md). The older npm sync helper is repo-local and replaces its output files; do not use it to merge shared global settings.
