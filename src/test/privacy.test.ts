import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
describe("private repository paths", () => {
  for (const path of ["browser-profile/session.json", "assets/resume.pdf", ".env", ".mcp.json", ".cursor/mcp.json", "context/profile.md", "context/form-answers.yaml", "logs/applications-log.json", "logs/runs/2026-11-18.json"]) {
    it(`excludes ${path} from Git`, () => {
      expect(execFileSync("git", ["check-ignore", "--no-index", path], {encoding:"utf8"}).trim()).toBe(path);
    });
  }
});
