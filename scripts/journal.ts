import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { Application, ApplicationsLog } from "../schemas/index.ts";
import { execFileSync } from "node:child_process";
const root = resolve(import.meta.dirname, "..");
const [input, token] = process.argv.slice(2);
try {
  if (!input || !token) throw new Error("Usage: journal ENTRY_JSON_PATH LOCK_TOKEN");
  const lock = JSON.parse(readFileSync(resolve(root, "logs/run.lock"), "utf8"));
  if (lock.owner !== token) throw new Error("Lock ownership mismatch");
  const entry = Application.parse(JSON.parse(readFileSync(resolve(input), "utf8")));
  const file = resolve(root, "logs/applications-log.json");
  const apps = ApplicationsLog.parse(existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : []);
  const index = apps.findIndex(a => a.job_id === entry.job_id);
  if (index >= 0 && apps[index]?.status === "applied") throw new Error("Already applied: immutable receipt");
  if (entry.status === "applied" && (!entry.applied_at || entry.submission_uncertain)) throw new Error("Confirmed receipt timestamp required");
  if (index < 0 && entry.status === "applied") throw new Error("Reserve before submitting");
  if (index >= 0) apps[index] = entry; else apps.push(entry);
  ApplicationsLog.parse(apps);
  const temp = `${file}.tmp`;
  writeFileSync(temp, JSON.stringify(apps, null, 2) + "\n", { mode: 0o600 });
  renameSync(temp, file);
  execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "validate:logs"], { cwd: root, stdio: "inherit" });
} catch {
  console.error("Journal rejected. Check schema, lock ownership and existing application; no automatic submit.");
  process.exit(1);
}
