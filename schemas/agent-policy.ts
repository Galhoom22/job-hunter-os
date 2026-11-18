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