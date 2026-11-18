# MCP setup (Playwright + Notion)

`mcp/mcp.template.json` is the single source. Generate IDE-specific configs with:

```bash
npm install
cp .env.example .env          # put your NOTION_TOKEN here
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

## 2. Connect Notion

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
