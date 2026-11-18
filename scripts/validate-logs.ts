import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { ApplicationsLog, DailyRun, Insight, SessionCheckpoint, SkippedJobsLog } from "../schemas/index.ts";
const root = resolve(import.meta.dirname, "..", process.argv.includes("--demo") ? "demo" : "logs");
let failed = 0;
function check(file: string, schema: z.ZodTypeAny) {
  try {
    const r = schema.safeParse(JSON.parse(readFileSync(file, "utf8")));
    if (!r.success) { failed++; console.error(`Invalid record: ${file} (schema mismatch)`); return null; }
    console.log(`Valid: ${file}`); return r.data;
  } catch { failed++; console.error(`Invalid JSON: ${file}`); return null; }
}
const file = resolve(root, "applications-log.json");
if (existsSync(file)) {
  const apps = check(file, ApplicationsLog);
  if (apps && new Set(apps.map((a: {job_id: string}) => a.job_id)).size !== apps.length) { failed++; console.error("Duplicate job_id in application history"); }
} else console.log("No application history; preflight requires initialization before running.");
const skipped = resolve(root, "skipped-jobs.json");
if (existsSync(skipped)) {
  const list = check(skipped, SkippedJobsLog);
  if (list && new Set(list.map((s: {job_id: string}) => s.job_id)).size !== list.length) { failed++; console.error("Duplicate job_id in skipped-jobs.json"); }
}
for (const [dir, schema] of [["runs", DailyRun], ["insights", Insight]] as const) {
  const d = resolve(root, dir);
  if (existsSync(d)) for (const f of readdirSync(d).filter(f => f.endsWith(".json"))) {
    check(resolve(d, f), dir === "runs" && f === "current-session-checkpoint.json" ? SessionCheckpoint : schema);
  }
}
process.exit(failed ? 1 : 0);
