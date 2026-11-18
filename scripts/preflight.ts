import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { parse } from "yaml";
import { auditReadiness } from "../bin/readiness.mjs";
import { withinActiveHours } from "../schemas/runtime";
import { agentDailyCap } from "../schemas/agent-policy";
import { ApplicationsLog, DailyRun, Guardrails, FormAnswers, Targets, canApply } from "../schemas/index.ts";
const root = resolve(import.meta.dirname, "..");
const p = (f: string) => resolve(root, f);
const problems: string[] = [];
function read(f: string) {
  if (!existsSync(p(f))) { problems.push(`missing ${f}: copy its .example template`); return ""; }
  return readFileSync(p(f), "utf8");
}
function yaml(f: string) { try { return parse(read(f)); } catch { problems.push(`invalid YAML: ${f}`); return null; } }
const profile = read("context/profile.md");
const cv = read("context/cv.md");
if (/example\.com|your-handle|your-site|Acme Fintech|Nile Commerce/i.test(profile + cv)) problems.push("profile/CV still contain synthetic example facts");
const g = Guardrails.safeParse(yaml("config/guardrails.yaml"));
const answers = FormAnswers.safeParse(yaml("context/form-answers.yaml"));
const targets = Targets.safeParse(yaml("context/targets.yaml"));
const preferences = yaml("context/preferences.yaml");
const readiness = auditReadiness(root, { answers: answers.success ? answers.data : undefined, targets: targets.success ? targets.data : undefined });
if (!readiness.overall_ready) {
  for (const [key, gate] of Object.entries(readiness.gates)) for (const missing of gate.missing) problems.push(`${key}: ${missing}`);
  problems.push("HARD BLOCK: complete skills/00-interrogate-and-onboard.md and obtain per-run launch confirmation");
}
if (!g.success) problems.push("invalid guardrails: require score >=7, review floor 5, agent action delays 3–9s (legacy delay_seconds 3–8) and CAPTCHA/2FA stops");
if (!answers.success) problems.push("form answers must be owner-verified and include ./assets/<resume>.pdf or ./context/resume.pdf");
if (!targets.success || !targets.data.targets.some(t => t.enabled)) problems.push("need valid enabled targets");
if (answers.success) {
  const pdf = p(answers.data.resume_pdf_path);
  if (!existsSync(pdf) || readFileSync(pdf).subarray(0, 5).toString() !== "%PDF-") problems.push("resume PDF missing or invalid");
}
if (g.success && g.data.storage_adapters.notion_mcp) for (const key of ["applications_db", "daily_runs_db", "insights_db"]) {
  if (!/^[a-f0-9]{32}$/i.test(String(preferences?.notion?.[key] ?? "").replace(/-/g, ""))) problems.push(`set Notion ${key}`);
}
const configFile = [".mcp.json", ".cursor/mcp.json"].find(f => existsSync(p(f)));
if (!configFile) problems.push("generate MCP config: npm run sync:mcp");
else {
  try {
    const c = JSON.parse(readFileSync(p(configFile), "utf8"));
    if (!c.mcpServers?.playwright?.args?.some((a: string) => a.startsWith("--user-data-dir="))) problems.push("persistent browser profile missing in MCP config");
    const token = c.mcpServers?.notion?.env?.NOTION_TOKEN;
    if (g.success && g.data.storage_adapters.notion_mcp && (!token || /replace|xxx/i.test(token))) problems.push("Notion token is not configured");
  } catch { problems.push("MCP config is invalid JSON"); }
}
if (!existsSync(p("browser-profile"))) problems.push("browser profile missing: complete headed login first");
try { execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "validate:logs"], { cwd: root, stdio: "pipe" }); }
catch { problems.push("logs invalid: run npm run validate:logs"); }
if (!existsSync(p("logs/applications-log.json"))) problems.push("initialize private applications log to [] before first run");
else try {
  const apps = ApplicationsLog.parse(JSON.parse(readFileSync(p("logs/applications-log.json"), "utf8")));
  const runsDir = p("logs/runs");
  const runs = existsSync(runsDir) ? readdirSync(runsDir).filter(f => f.endsWith(".json") && f !== "current-session-checkpoint.json").map(f => DailyRun.parse(JSON.parse(readFileSync(resolve(runsDir, f), "utf8")))) : [];
  const today = new Date().toISOString().slice(0, 10);
  if (g.success && !canApply(apps, "__any__", today, {...g.data,max_applications_per_day:agentDailyCap(g.data.max_applications_per_day,g.data.warmup_mode,today,runs)})) problems.push("daily cap reached");
} catch { problems.push("application history invalid"); }
if (g.success && targets.success) for (const t of targets.data.targets.filter(t => t.enabled)) {
  if (g.data.max_per_platform[t.platform] === undefined) problems.push(`missing cap for ${t.platform}`);
}
if(g.success && !withinActiveHours(new Date(),g.data.active_hours)) problems.push("outside configured active hours");
if (problems.length) { console.error("Preflight blocked:\n- " + problems.join("\n- ")); process.exit(1); }
console.log("Preflight passed locally; browser login and Notion access still require live verification.");
