import { effectiveDailyCap, type RuntimeControls } from "./runtime";

/** Idle calendar days cannot bypass the first three authorized run dates. */
export function agentDailyCap(
  maximum: number,
  warmup: RuntimeControls["warmup_mode"],
  today: string,
  runs: readonly { run_id: string; status: "running" | "completed" | "aborted" }[],
) {
  const calendarCap = effectiveDailyCap(maximum, warmup, today);
  if (!warmup.enabled) return calendarCap;
  const authorizedDates = new Set(runs.filter(run => run.status !== "aborted" && run.run_id <= today).map(run => run.run_id));
  authorizedDates.add(today);
  return authorizedDates.size <= 3 ? Math.min(calendarCap, 5) : calendarCap;
}

export type TriageTier = "A" | "B" | "C";
/** Tier A 8-10 strong match; B 5 to below 8 stretch (owner decides); C below 5 or any dealbreaker (skip and log). */
export function triageTier(score: number, dealbreaker = false): TriageTier {
  if (!Number.isFinite(score) || score < 0 || score > 10) throw new Error("Invalid score");
  if (dealbreaker || score < 5) return "C";
  return score >= 8 ? "A" : "B";
}

export type BatchRow = { n: number; tier: TriageTier };
/**
 * Parses the owner's Mission Control reply. Only "APPLY ALL GREEN" or "APPLY 1,3,5" select jobs;
 * Tier C rows and unknown numbers are rejected, never silently applied. Anything else returns null (no action).
 * Selection only opens forms: dry run, approval mode, caps, score routing and stop rules still apply per job.
 */
export function parseBatchReply(reply: string, rows: readonly BatchRow[]) {
  const text = reply.trim().replace(/\s+/g, " ").toUpperCase();
  if (text === "APPLY ALL GREEN") return { selected: rows.filter(r => r.tier === "A").map(r => r.n), rejected: [] as { n: number; reason: string }[] };
  const m = text.match(/^APPLY ((?:\d+\s*,\s*)*\d+)$/);
  if (!m) return null;
  const wanted = [...new Set(m[1].split(",").map(x => Number(x.trim())))];
  const selected: number[] = [], rejected: { n: number; reason: string }[] = [];
  for (const n of wanted) {
    const row = rows.find(r => r.n === n);
    if (!row) rejected.push({ n, reason: "no such row in this batch" });
    else if (row.tier === "C") rejected.push({ n, reason: "skipped as a mismatch/dealbreaker" });
    else selected.push(n);
  }
  return { selected, rejected };
}
