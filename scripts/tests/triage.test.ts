import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { parseBatchReply, triageTier, type BatchRow } from "../../schemas/agent-policy";
import { Guardrails, SkippedJob } from "../../schemas";

const config = parse(readFileSync(new URL("../../config/guardrails.yaml", import.meta.url), "utf8"));
const rows: BatchRow[] = [{ n: 1, tier: "A" }, { n: 2, tier: "B" }, { n: 3, tier: "A" }, { n: 4, tier: "C" }];

describe("three-tier triage", () => {
  it("scores 8 to 10 are Tier A", () => { expect(triageTier(8)).toBe("A"); expect(triageTier(10)).toBe("A"); });
  it("scores 5 to below 8 are Tier B stretch", () => { expect(triageTier(7.9)).toBe("B"); expect(triageTier(5)).toBe("B"); });
  it("scores below 5 are Tier C", () => expect(triageTier(4.9)).toBe("C"));
  it("a dealbreaker forces Tier C even for a high score", () => expect(triageTier(9.5, true)).toBe("C"));
  it("rejects out-of-range scores", () => expect(() => triageTier(11)).toThrow());
});

describe("Mission Control replies", () => {
  it("APPLY ALL GREEN selects only Tier A rows", () => expect(parseBatchReply("apply all green", rows)).toEqual({ selected: [1, 3], rejected: [] }));
  it("APPLY 1,2 selects the listed A and B rows", () => expect(parseBatchReply("APPLY 1, 2", rows)?.selected).toEqual([1, 2]));
  it("Tier C and unknown rows are refused, not applied", () => {
    const result = parseBatchReply("APPLY 3,4,9", rows);
    expect(result?.selected).toEqual([3]);
    expect(result?.rejected.map(r => r.n)).toEqual([4, 9]);
  });
  it("anything that is not an APPLY command selects nothing", () => {
    expect(parseBatchReply("looks good", rows)).toBeNull();
    expect(parseBatchReply("tweak 2 then APPLY 1", rows)).toBeNull();
  });
});

describe("guardrails workflow settings", () => {
  it("shipped config uses batch_review_first with a batch of 10", () => {
    const parsed = Guardrails.parse(config);
    expect(parsed.workflow_mode).toBe("batch_review_first");
    expect(parsed.batch_size).toBe(10);
  });
  it("older configs without the new keys default to batch_review_first", () => {
    const { workflow_mode, batch_size, pregenerate_stretch_resumes, ...legacy } = config;
    expect([workflow_mode, batch_size, pregenerate_stretch_resumes]).toHaveLength(3);
    expect(Guardrails.parse(legacy).workflow_mode).toBe("batch_review_first");
  });
  it("accepts direct_auto", () => expect(Guardrails.safeParse({ ...config, workflow_mode: "direct_auto" }).success).toBe(true));
  it("rejects unknown workflow modes", () => expect(Guardrails.safeParse({ ...config, workflow_mode: "yolo" }).success).toBe(false));
  it("batch size must be 1 to 20", () => {
    expect(Guardrails.safeParse({ ...config, batch_size: 0 }).success).toBe(false);
    expect(Guardrails.safeParse({ ...config, batch_size: 21 }).success).toBe(false);
  });
});

describe("skipped-jobs log", () => {
  const entry = { job_id: "linkedin:42", platform: "linkedin", company: "Lumen", title: "iOS Developer", url: "https://www.linkedin.com/jobs/view/42", match_score: 2, tier: "C", skip_reason: "Swift-only role; no iOS experience", skipped_at: "2026-11-18T04:00:00Z", run_id: "2026-11-18" };
  it("accepts a one-line Tier C entry", () => expect(SkippedJob.safeParse(entry).success).toBe(true));
  it("rejects multi-line skip reasons", () => expect(SkippedJob.safeParse({ ...entry, skip_reason: "a\nb c" }).success).toBe(false));
  it("only Tier C jobs belong in the skipped log", () => expect(SkippedJob.safeParse({ ...entry, tier: "B" }).success).toBe(false));
});
