import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { parse } from "yaml";
import { ApplicationsLog, canApply } from "../schemas/index.ts";

const root = resolve(import.meta.dirname, "..");
const p = (f: string) => resolve(root, f);
const problems: string[] = [];
const ok = (m: string) => console.log(`✔ ${m}`);

for (const f of ["context/profile.md", "context/cv.md", "context/preferences.yaml", "context/targets.yaml", "context/form-answers.yaml", "config/guardrails.yaml"]) {
  existsSync(p(f)) ? ok(f) : problems.push(`missing ${f} (copy from ${f}.example)`);
}
if (!existsSync(p(".mcp.json")) && !existsSync(p(".cursor/mcp.json"))) problems.push("no MCP config — run npm run sync:mcp");
else ok("MCP config present");
if (!existsSync(p("browser-profile"))) console.warn("⚠ browser-profile/ not found — log in once (see mcp/README.md)");

const g = parse(readFileSync(p("config/guardrails.yaml"), "utf8"));
console.log(`ℹ dry_run=${g.dry_run} cap=${g.max_applications_per_day}/day min_score=${g.min_match_score}`);
const targets = parse(readFileSync(p("context/targets.yaml"), "utf8"))?.targets ?? [];
const enabled = targets.filter((t: { enabled: boolean }) => t.enabled);
enabled.length ? ok(`${enabled.length} enabled targets`) : problems.push("no enabled targets");

try { execSync("npx tsx scripts/validate-logs.ts", { cwd: root, stdio: "pipe" }); ok("logs valid"); }
catch (e: any) { problems.push("logs invalid — run npm run validate:logs\n" + e.stderr?.toString()); }

if (existsSync(p("logs/applications-log.json"))) {
  const apps = ApplicationsLog.parse(JSON.parse(readFileSync(p("logs/applications-log.json"), "utf8")));
  const today = new Date().toISOString().slice(0, 10);
  if (!canApply(apps, "__any__", today, g)) problems.push("daily application cap already reached");
  else ok("daily cap not reached");
}
if (problems.length) { console.error("\n✘ Preflight failed:\n - " + problems.join("\n - ")); process.exit(1); }
console.log("\n✔ Preflight passed");
