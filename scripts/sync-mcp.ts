import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
const root = resolve(import.meta.dirname, "..");
const env: Record<string, string | undefined> = { ...process.env };
const envFile = resolve(root, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m?.[1] && m[2] !== undefined) env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
}
const prefs = parse(readFileSync(resolve(root,"config/guardrails.yaml"),"utf8"));
const notionEnabled = prefs.storage_adapters?.notion_mcp === true;
if(notionEnabled && (!env.NOTION_TOKEN || /replace|xxx/i.test(env.NOTION_TOKEN))) { console.error("Optional Notion enabled but no valid local token; disable adapter or configure token."); process.exit(1); }
const config = JSON.parse(readFileSync(resolve(root, "mcp/mcp.template.json"), "utf8"));
const args: string[] = config.mcpServers.playwright.args;
config.mcpServers.playwright.args = args.map(a => a === "--user-data-dir=./browser-profile"
  ? `--user-data-dir=${resolve(root, "browser-profile").replace(/\\/g, "/")}` : a);
if (process.argv.includes("--headless")) config.mcpServers.playwright.args.push("--headless");
if(notionEnabled) config.mcpServers.notion.env.NOTION_TOKEN = env.NOTION_TOKEN;
else delete config.mcpServers.notion;
const text = JSON.stringify(config, null, 2) + "\n";
mkdirSync(resolve(root, ".cursor"), { recursive: true });
for (const name of [".mcp.json", ".cursor/mcp.json"]) writeFileSync(resolve(root, name), text, { mode: 0o600 });
console.log("Generated private Claude Code and Cursor MCP configs; restart MCP tools to use the selected mode.");
