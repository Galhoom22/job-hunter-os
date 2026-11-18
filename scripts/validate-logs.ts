import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { ApplicationsLog, DailyRun, Insight } from "../schemas/index.ts";

const root = resolve(import.meta.dirname, "..");
let failed = 0;
function check(file: string, schema: { safeParse: (v: unknown) => any }) {
  const r = schema.safeParse(JSON.parse(readFileSync(file, "utf8")));
  if (!r.success) {
    failed++;
    console.error(`✘ ${file}`);
    for (const i of r.error.issues.slice(0, 10)) console.error(`   ${i.path.join(".")}: ${i.message}`);
  } else console.log(`✔ ${file}`);
}
const log = resolve(root, "logs/applications-log.json");
if (existsSync(log)) {
  check(log, ApplicationsLog);
  const ids = JSON.parse(readFileSync(log, "utf8")).map((a: { job_id: string }) => a.job_id);
  const dup = ids.filter((id: string, i: number) => ids.indexOf(id) !== i);
  if (dup.length) { failed++; console.error(`✘ duplicate job_id: ${[...new Set(dup)].join(", ")}`); }
}
for (const [dir, schema] of [["logs/runs", DailyRun], ["logs/insights", Insight]] as const) {
  const d = resolve(root, dir);
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d).filter((f) => f.endsWith(".json"))) check(resolve(d, f), schema);
}
process.exit(failed ? 1 : 0);
