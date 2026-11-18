# MCP setup (Playwright + Notion)

`mcp/mcp.template.json` is the single source. Generate IDE-specific configs with:

```bash
npm install
cp .env.example .env          # optional: NOTION_TOKEN only if enabling Notion
npm run sync:mcp              # writes .mcp.json (Claude Code) and .cursor/mcp.json (Cursor)
```

Antigravity: open *Agent → MCP Servers → Manage → View raw config* and paste the contents of the generated `.mcp.json`.

`sync:mcp` replaces `${NOTION_TOKEN}` with the value from `.env` and turns `./browser-profile` into an absolute path. Both generated files are gitignored.

## 1. Log in once (persistent browser profile)

Playwright MCP launches Chromium with `--user-data-dir=./browser-profile`. Cookies live **only** on your disk.

1. In your IDE chat say: *"Open https://www.linkedin.com/login with Playwright."*
2. A real Chromium window opens. **You** type your credentials / click "Continue with Google". Complete 2FA.
3. Repeat for Google (`https://accounts.google.com`), Wellfound, Wuzzuf and any ATS you use.
4. Close the browser. Next runs reuse the session. The agent never sees your password.

Tip: if a session expires, the agent stops at "Auth Verification" and asks you to log in again.

## 2. Connect Notion (optional)

First enable storage_adapters.notion_mcp in config/guardrails.yaml. Without it, no token or databases are needed; generated configs contain Playwright only.

1. Go to https://www.notion.so/profile/integrations → **New integration** (internal). Copy the secret (`ntn_...`).
2. Put it in `.env` as `NOTION_TOKEN=ntn_...` and re-run `npm run sync:mcp`.
3. In Notion, create a page "Job Hunter" with three databases:
   - **Applications**: Title (job title), Company, Platform (select), Status (select), Match Score (number), Missing Skills (multi-select), URL, Applied At (date), Job ID (text)
   - **Daily Runs**: Date, Scanned, Applied, Needs Review, Skipped, Errors, Dry Run (checkbox), Notes
   - **Weekly & Monthly Insights**: Period, Type (Weekly/Monthly), Match Rate, Top Skills, Skill Gaps, Recommendations
4. Open the page → `•••` → **Connections** → add your integration.
5. Copy each database ID into `context/preferences.yaml -> notion`.

## Troubleshooting

- "Browser is already in use": close other Chromium windows that use `./browser-profile`.
- Notion 401: token missing in the generated config — re-run `npm run sync:mcp`.

## Headed login vs background mode

- First login: `npm run sync:mcp` (headed). Start Playwright MCP from your IDE, open enabled sites and log in yourself, including 2FA. No passwords in prompts. Confirm named account menus in snapshots.
- Background: close the headed browser, then `npm run sync:mcp -- --headless` and restart the IDE's MCP servers. The SAME absolute browser-profile path is reused. Never run two Chromium instances against that profile.
- Return to headed with `npm run sync:mcp` when a session expires. CAPTCHA/2FA/login walls pause the entire run; notify the owner and do not solve/bypass them.
- Claude Code/Cursor read generated configs. Antigravity, Windsurf, Cline/Roo and Copilot may use different MCP settings formats depending on version: copy server definitions locally into the IDE's own supported settings; never commit secret-bearing copies. Instruction pointers do not install MCP tools or grant permissions.
- An open dashboard cannot run browser automation. Headless is not a scheduler. Use your IDE/model's documented local task mechanism, keep the machine/agent process running, acquire the repo run lock and require successful preflight. No universal unattended scheduling guarantee.
- Random 3–8 second waits and modest scrolling reduce load; follow platform terms, do not hide automation. Playwright tools/Notion tools must actually appear in the agent before starting.

Generated configs embed the token locally using JSON serialization (safe for quotes/backslashes) and mode 0600 where supported. Do not print/share/commit them. Template uses latest packages as requested; for operational deployments review and pin tested versions in the template before upgrades.
