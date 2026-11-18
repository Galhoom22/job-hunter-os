# Connect local MCP tools for zero-code job hunting

The canonical MCP definition is [`mcp/mcp.template.json`](mcp.template.json). Paste it into your IDE's MCP configuration with `./browser-profile` pointing to your local clone (or agent folder):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--user-data-dir=./browser-profile"]
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_TOKEN}"
      }
    }
  }
}
```

- **Playwright MCP (required for browser workflows):** Launches Chromium with persistent `./browser-profile` so you log in manually once and keep sessions private on disk. Never commit `browser-profile/`.
- **Notion MCP (optional):** Off by default (`storage_adapters.notion_mcp: false` in `config/guardrails.yaml`). If you want Notion tracking, set `NOTION_TOKEN` in your IDE's secret/env config, share a parent page with your Notion integration, and record your database IDs in `context/preferences.yaml`. Local JSON under `logs/` is always primary.

## Manual login once
1. Open your project folder in your AI IDE and ask `/setup` to open your chosen boards in headed Playwright MCP.
2. Enter passwords and complete any 2FA/CAPTCHA privately in the browser window—never share credentials in chat.
3. Confirm in chat once signed in; the agent snapshots an account indicator and proceeds without storing cookies or passwords.
