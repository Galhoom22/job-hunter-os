import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { ApplicationsLog, DailyRun, Insight } from "../schemas/index.ts";
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
for (const [dir, schema] of [["runs", DailyRun], ["insights", Insight]] as const) {
  const d = resolve(root, dir);
  if (existsSync(d)) for (const f of readdirSync(d).filter(f => f.endsWith(".json"))) check(resolve(d, f), schema);
}
process.exit(failed ? 1 : 0);
