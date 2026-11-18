import { z } from "zod";

export const Platform = z.enum(["linkedin", "wellfound", "wuzzuf", "greenhouse", "lever", "other"]);
export const Status = z.enum([
  "discovered",
  "skipped",
  "dry_run",
  "applied",
  "needs_review",
  "failed",
  "aborted",
]);

export const OpenQuestion = z.object({
  question: z.string().min(1),
  field_type: z.string().optional(),
  options: z.array(z.string()).optional(),
});

export const DiscoveredJob = z.object({
  job_id: z.string().regex(/^[a-z]+:.+$/, "job_id must look like platform:id"),
  title: z.string().min(1),
  company: z.string().min(1),
  platform: Platform,
  url: z.string().url(),
  location: z.string().default(""),
  apply_type: z.enum(["easy_apply", "external"]),
  discovered_at: z.string().datetime(),
});

export const Application = DiscoveredJob.extend({
  status: Status,
  match_score: z.number().min(0).max(10),
  matched_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  open_questions: z.array(OpenQuestion).default([]),
  screenshot: z.string().nullable().default(null),
  run_id: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  applied_at: z.string().datetime().nullable(),
  notes: z.string().default(""),
  notion_synced: z.boolean(),
});

export const DailyRun = z.object({
  run_id: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  started_at: z.string().datetime(),
  finished_at: z.string().datetime().nullable(),
  dry_run: z.boolean(),
  status: z.enum(["running", "completed", "aborted"]),
  counts: z.object({
    scanned: z.number().int().nonnegative(),
    applied: z.number().int().nonnegative(),
    dry_run: z.number().int().nonnegative(),
    needs_review: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
  }),
  platforms: z.array(Platform),
  errors: z.array(z.string()),
  steps: z.array(z.object({ at: z.string(), step: z.string(), detail: z.string().optional() })),
  notes: z.string().default(""),
});

export const Insight = z.object({
  type: z.enum(["weekly", "monthly"]),
  period: z.string(),
  generated_at: z.string().datetime(),
  scanned: z.number().int(),
  applied: z.number().int(),
  match_rate: z.number().min(0).max(1),
  avg_match_score: z.number(),
  top_skills: z.array(z.object({ skill: z.string(), count: z.number().int() })),
  skill_gaps: z.array(z.object({ skill: z.string(), count: z.number().int() })),
  recommendations: z.array(z.string()),
});

export const ApplicationsLog = z.array(Application);

export type Application = z.infer<typeof Application>;
export type DailyRun = z.infer<typeof DailyRun>;
export type Insight = z.infer<typeof Insight>;
export type DiscoveredJob = z.infer<typeof DiscoveredJob>;

/** Guardrail rule: can another application be submitted right now? */
export function canApply(
  apps: Pick<Application, "status" | "platform" | "applied_at">[],
  platform: string,
  today: string,
  limits: { max_applications_per_day: number; max_per_platform: Record<string, number> },
): boolean {
  const todays = apps.filter((a) => a.status === "applied" && a.applied_at?.startsWith(today));
  if (todays.length >= limits.max_applications_per_day) return false;
  const cap = limits.max_per_platform[platform];
  if (cap !== undefined && todays.filter((a) => a.platform === platform).length >= cap) return false;
  return true;
}
