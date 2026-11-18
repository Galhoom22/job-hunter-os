import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const env: Record<string, string> = { ...(process.env as Record<string, string>) };
const envFile = resolve(root, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
let tpl = readFileSync(resolve(root, "mcp/mcp.template.json"), "utf8");
tpl = tpl.replace("--user-data-dir=./browser-profile", `--user-data-dir=${resolve(root, "browser-profile").replace(/\\/g, "/")}`);
tpl = tpl.replace(/\$\{([A-Z0-9_]+)\}/g, (_, k) => {
  if (!env[k]) console.warn(`⚠ ${k} is not set (.env) — left empty`);
  return env[k] ?? "";
});
JSON.parse(tpl);
writeFileSync(resolve(root, ".mcp.json"), tpl);
mkdirSync(resolve(root, ".cursor"), { recursive: true });
writeFileSync(resolve(root, ".cursor/mcp.json"), tpl);
console.log("✔ wrote .mcp.json and .cursor/mcp.json");
