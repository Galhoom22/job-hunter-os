import { describe, expect, it } from "vitest";
import { setDryRunInText } from "../lib/yaml-edit";

const GUARDRAILS = `# Safety settings read by every skill. Start with dry_run: true.
dry_run: true
max_applications_per_day: 20
delay_seconds: [3, 8]
min_match_score: 7
`;

describe("dry-run switch file edit", () => {
  it("changes only the dry_run line", () => {
    const expected = `# Safety settings read by every skill. Start with dry_run: true.
dry_run: false
max_applications_per_day: 20
delay_seconds: [3, 8]
min_match_score: 7
`;
    expect(setDryRunInText(GUARDRAILS, false)).toBe(expected);
  });

  it("flips back to the original text exactly", () => {
    expect(setDryRunInText(setDryRunInText(GUARDRAILS, false), true)).toBe(GUARDRAILS);
  });

  it("keeps an inline comment on the dry_run line", () => {
    expect(setDryRunInText("dry_run: true # never submit\n", false)).toBe("dry_run: false # never submit\n");
  });

  it("adds the key when the file has none", () => {
    expect(setDryRunInText("max_applications_per_day: 20\n", true)).toBe("max_applications_per_day: 20\ndry_run: true\n");
  });
});
