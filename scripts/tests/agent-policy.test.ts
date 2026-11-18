import { describe, expect, it } from "vitest";
import { agentDailyCap } from "../../schemas/agent-policy";
import { Guardrails } from "../../schemas";
import { RuntimeControls } from "../../schemas/runtime";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

const config = parse(readFileSync(new URL("../../config/guardrails.yaml", import.meta.url), "utf8"));
const warmup = { enabled: true, started_on: "2026-11-01", initial_cap: 5, stage_days: 3, increment: 5 };
const completed = (run_id: string) => ({ run_id, status: "completed" as const });

describe("chat-first safety policy", () => {
  it("caps each of the first three distinct run dates at five despite calendar gaps", () => {
    const history: ReturnType<typeof completed>[] = [];
    for (const date of ["2026-11-01", "2026-11-10", "2026-11-18"]) {
      expect(agentDailyCap(20, warmup, date, history)).toBe(5);
      history.push(completed(date));
    }
  });
  it("repeated records on one date cannot accelerate warm-up", () => {
    expect(agentDailyCap(20, warmup, "2026-11-18", Array.from({ length: 8 }, () => completed("2026-11-01")))).toBe(5);
  });
  it("does not count aborted or future runs as authorized warm-up dates", () => {
    expect(agentDailyCap(20, warmup, "2026-11-18", [completed("2026-12-01"), { run_id: "2026-11-02", status: "aborted" }])).toBe(5);
  });
  it("allows configured maximum after three distinct authorized dates while retaining calendar policy", () => {
    expect(agentDailyCap(20, warmup, "2026-11-18", ["2026-11-01", "2026-11-10", "2026-11-17"].map(completed))).toBe(20);
  });
  it("never raises a lower configured cap", () => {
    expect(agentDailyCap(3, warmup, "2026-11-18", [])).toBe(3);
  });
  it("calendar warm-up may remain more conservative on the fourth run date", () => {
    expect(agentDailyCap(20, { ...warmup, started_on: "2026-11-15" }, "2026-11-18", ["2026-11-15", "2026-11-16", "2026-11-17"].map(completed))).toBe(10);
  });
  it("accepts the requested three-to-nine second pacing range", () => {
    const controls = (action_delay_seconds: number[]) => ({ ...config, human_behavior: { ...config.human_behavior, action_delay_seconds } });
    expect(RuntimeControls.safeParse(controls([3, 9])).success).toBe(true);
    expect(RuntimeControls.safeParse(controls([2, 9])).success).toBe(false);
    expect(RuntimeControls.safeParse(controls([3, 10])).success).toBe(false);
    expect(Guardrails.safeParse(config).success).toBe(true);
    expect(config.human_behavior.action_delay_seconds).toEqual([3, 9]);
  });
});