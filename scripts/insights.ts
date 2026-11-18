import { readFileSync, writeFileSync, mkdirSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { ApplicationsLog, Insight } from "../schemas/index.ts";
import { summarizePeriod } from "../schemas/analytics.ts";
const root = resolve(import.meta.dirname, "..");
const [type, period, start, end, token] = process.argv.slice(2);
try {
  if ((type !== "weekly" && type !== "monthly") || !period || !start || !end || !token) throw new Error("Usage: insights weekly|monthly PERIOD START_ISO END_ISO LOCK_TOKEN");
  if (!/^\d{4}-(W\d{2}|\d{2})$/.test(period) || !Number.isFinite(Date.parse(start)) || !Number.isFinite(Date.parse(end)) || start >= end) throw new Error("Invalid period");
  const lock = JSON.parse(readFileSync(resolve(root,"logs/run.lock"),"utf8"));
  if (lock.owner !== token) throw new Error("Lock ownership mismatch");
  const apps = ApplicationsLog.parse(JSON.parse(readFileSync(resolve(root,"logs/applications-log.json"),"utf8")));
  const report = Insight.parse(summarizePeriod(apps,type,period,start,end,new Date().toISOString()));
  mkdirSync(resolve(root,"logs/insights"),{recursive:true});
  const file=resolve(root,`logs/insights/${type}-${period}.json`);
  writeFileSync(`${file}.tmp`,JSON.stringify(report,null,2)+"\n",{mode:0o600}); renameSync(`${file}.tmp`,file);
  execFileSync(process.platform === "win32" ? "npm.cmd" : "npm",["run","validate:logs"],{cwd:root,stdio:"inherit"});
} catch { console.error("Report rejected: check lock, period and validated history."); process.exit(1); }
