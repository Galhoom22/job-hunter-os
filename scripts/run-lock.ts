import { mkdirSync, writeFileSync, readFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
const root = resolve(import.meta.dirname, "..");
const file = resolve(root, "logs/run.lock");
const [command, token] = process.argv.slice(2);
try {
  if (command === "acquire") {
    mkdirSync(resolve(root, "logs"), { recursive: true });
    const owner = randomUUID();
    writeFileSync(file, JSON.stringify({ owner, pid: process.pid, started_at: new Date().toISOString() }), { flag: "wx", mode: 0o600 });
    console.log(`Lock acquired: ${owner}`);
  } else if (command === "release" && token) {
    const lock = JSON.parse(readFileSync(file, "utf8"));
    if (lock.owner !== token) throw new Error("Lock ownership mismatch");
    unlinkSync(file);
    console.log("Lock released");
  } else throw new Error("Use acquire or release TOKEN");
} catch {
  console.error("Run lock refused. Check ownership; never remove another run's lock.");
  process.exit(1);
}
