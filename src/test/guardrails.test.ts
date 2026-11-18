import { describe, expect, it } from "vitest";
import { canApply } from "../../schemas/index";

const limits = { max_applications_per_day: 20, max_per_platform: { linkedin: 12, wellfound: 5, wuzzuf: 5 } };
const today = "2026-11-18";
const applied = (platform: string, n: number) =>
  Array.from({ length: n }, () => ({ status: "applied" as const, platform: platform as "linkedin", applied_at: `${today}T10:00:00Z` }));

describe("guardrail caps", () => {
  it("blocks a 21st application in one day", () => {
    expect(canApply([...applied("linkedin", 10), ...applied("wellfound", 5), ...applied("wuzzuf", 5)], "greenhouse", today, limits)).toBe(false);
  });
  it("blocks LinkedIn after 12 applications today", () => {
    expect(canApply(applied("linkedin", 12), "linkedin", today, limits)).toBe(false);
  });
  it("allows Wellfound after 4 but not after 5", () => {
    expect(canApply(applied("wellfound", 4), "wellfound", today, limits)).toBe(true);
    expect(canApply(applied("wellfound", 5), "wellfound", today, limits)).toBe(false);
  });
  it("ignores applications from other days", () => {
    const old = applied("linkedin", 12).map((a) => ({ ...a, applied_at: "2026-11-17T10:00:00Z" }));
    expect(canApply(old, "linkedin", today, limits)).toBe(true);
  });
});
