import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { Targets } from "../../schemas/index";

const registry = parse(readFileSync(new URL("../../context/targets.yaml.example", import.meta.url), "utf8"));
const patterns: Record<string, string> = {
  linkedin: "https://www.linkedin.com/jobs/search/?keywords={{ROLE_ENCODED}}&f_WT=2&f_TPR=r86400",
  wellfound: "https://wellfound.com/role/r/{{ROLE_SLUG}}",
  indeed: "https://www.indeed.com/jobs?q={{ROLE_ENCODED}}&l=Remote&fromage=1",
  glassdoor: "https://www.glassdoor.com/Job/jobs.htm?sc.keyword={{ROLE_ENCODED}}",
  weworkremotely: "https://weworkremotely.com/remote-jobs/search?term={{ROLE_ENCODED}}",
  remoteok: "https://remoteok.com/remote-{{ROLE_SLUG}}-jobs",
  welcometothejungle: "https://app.welcometothejungle.com/jobs",
  builtin: "https://builtin.com/jobs/remote?search={{ROLE_ENCODED}}",
  dice: "https://www.dice.com/jobs?q={{ROLE_ENCODED}}&filters.workplaceTypes=Remote&filters.postedDate=ONE",
  ziprecruiter: "https://www.ziprecruiter.com/jobs-search?search={{ROLE_ENCODED}}&days=1",
  wuzzuf: "https://wuzzuf.net/search/jobs/?q={{ROLE_ENCODED}}&a=hpb",
  bayt: "https://www.bayt.com/en/international/jobs/{{ROLE_SLUG}}-jobs/",
};

describe("dynamic target registry contracts", () => {
  it("keeps all shipped targets disabled and concrete URLs compatible with runtime validation", () => {
    const parsed = Targets.parse(registry);
    expect(parsed.targets).toHaveLength(17);
    expect(parsed.targets.every(target => target.enabled === false)).toBe(true);
    expect(parsed.targets.every(target => !target.url.includes("{{"))).toBe(true);
  });

  for (const [platform, template] of Object.entries(patterns)) {
    it(`preserves the requested ${platform} search recipe`, () => {
      const target = registry.targets.find((entry: { platform: string }) => entry.platform === platform);
      expect(target?.search_url_template).toBe(template);
      const resolved = template.replaceAll("{{ROLE_ENCODED}}", encodeURIComponent("Frontend Engineer"))
        .replaceAll("{{ROLE_SLUG}}", "frontend-engineer");
      expect(target?.url).toBe(resolved);
      const url = new URL(resolved);
      for (const [key, value] of Object.entries(target.query_parameters)) {
        expect(url.searchParams.get(key)).toBe(value === "{{ROLE_ENCODED}}" ? "Frontend Engineer" : value);
      }
    });
  }

  for (const [platform, host] of [["greenhouse", "boards.greenhouse.io"], ["lever", "jobs.lever.co"], ["ashby", "jobs.ashbyhq.com"]]) {
    it(`keeps ${platform} Google discovery encoded and separate from submission`, () => {
      const target = registry.targets.find((entry: { platform: string }) => entry.platform === platform);
      const resolved = target.search_url_template.replaceAll("{{ROLE_ENCODED}}", encodeURIComponent("Frontend Engineer"));
      const url = new URL(resolved);
      expect(url.hostname).toBe("www.google.com");
      expect(url.searchParams.get("q")).toBe(`site:${host} "Frontend Engineer" AND "Remote"`);
      expect(url.searchParams.get("tbs")).toBe("qdr:d");
      expect(target.automation_mode).toBe("discovery_only_then_verified_ats");
      expect(target.enabled).toBe(false);
    });
  }
});