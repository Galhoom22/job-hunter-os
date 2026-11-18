import { z } from "zod";
import { RuntimeControls, effectiveDailyCap, withinActiveHours } from "./runtime";

export const Platform = z.enum(["linkedin", "wellfound", "wuzzuf", "greenhouse", "lever", "ashby", "smartrecruiters", "breezyhr", "workday", "taleo", "indeed", "glassdoor", "dice", "ziprecruiter", "weworkremotely", "remoteok", "builtin", "welcometothejungle", "bayt", "other"]);
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
  apply_type: z.enum(["easy_apply", "external", "manual_apply"]),
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
  notion_page_id: z.string().optional(),
  submission_uncertain: z.boolean().default(false),
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
  notion_synced: z.boolean().default(false),
  notion_page_id: z.string().optional(),
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

/** Tier C quick index (logs/skipped-jobs.json); the applications log still records each skipped disposition. */
export const SkippedJob = z.object({
  job_id: DiscoveredJob.shape.job_id,
  platform: Platform,
  company: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  match_score: z.number().min(0).max(10),
  tier: z.literal("C"),
  reason: z.string().min(1).max(64).optional(),
  skip_reason: z.string().min(3).max(160).regex(/^[^\n\r]+$/, "skip_reason must be one line"),
  skipped_at: z.string().datetime(),
  run_id: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export const SkippedJobsLog = z.array(SkippedJob);

export const SessionCheckpoint = z.object({
  kind: z.literal("session_checkpoint"),
  version: z.literal(1),
  run_id: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updated_at: z.string().datetime(),
  phase: z.enum(["readiness", "discovery", "triage", "awaiting_owner", "applying", "logging", "reporting", "finished", "aborted"]),
  workflow_mode: z.enum(["batch_review_first", "direct_auto"]),
  dry_run: z.boolean(),
  approval_mode: z.enum(["approve_before_submit", "auto_high_confidence", "dry_run"]),
  lock_started_at: z.string().datetime(),
  caps: z.object({
    effective_daily_cap: z.number().int().nonnegative(),
    applied_today: z.number().int().nonnegative(),
    reserved_unresolved: z.number().int().nonnegative(),
    per_platform_applied: z.record(z.number().int().nonnegative()),
  }),
  processed_job_ids: z.array(z.string()),
  queue: z.array(z.string()),
  awaiting_owner: z.array(z.object({ job_id: z.string(), question: z.string() })),
  batch_selection: z.string().default(""),
  consecutive_errors: z.number().int().nonnegative(),
  next_action: z.string(),
  notes: z.string().default(""),
});

export type Application = z.infer<typeof Application>;
export type DailyRun = z.infer<typeof DailyRun>;
export type Insight = z.infer<typeof Insight>;
export type DiscoveredJob = z.infer<typeof DiscoveredJob>;

/** Guardrail rule: can another application be submitted right now? */
export function canApply(
  apps: (Pick<Application, "status" | "platform" | "applied_at"> & Partial<Pick<Application, "submission_uncertain" | "discovered_at">>)[],
  platform: string,
  today: string,
  limits: { max_applications_per_day: number; max_per_platform: Record<string, number> },
): boolean {
  const todays = apps.filter((a) => (a.status === "applied" && a.applied_at?.startsWith(today)) || (a.submission_uncertain && a.discovered_at?.startsWith(today)));
  if (todays.length >= limits.max_applications_per_day) return false;
  const cap = limits.max_per_platform[platform];
  if (cap === undefined && platform !== "__any__") return false;
  if (cap !== undefined && todays.filter((a) => a.platform === platform).length >= cap) return false;
  return true;
}

export const Guardrails = z.object({
  dry_run: z.boolean(),
  approval_mode: z.enum(["approve_before_submit", "auto_high_confidence", "dry_run"]).default("approve_before_submit"),
  max_applications_per_day: z.number().int().min(1).max(20),
  max_per_platform: z.record(z.number().int().min(0).max(20)),
  min_match_score: z.number().min(7).max(10),
  review_min_score: z.literal(5),
  delay_seconds: z.tuple([z.number().min(3), z.number().max(8)]).refine(([a, b]) => a <= b),
  max_consecutive_errors: z.number().int().min(1).max(3),
  stop_on_captcha: z.literal(true),
  stop_on_2fa: z.literal(true),
}).merge(RuntimeControls);
export const FormAnswers = z.object({
  owner_verified: z.literal(true),
  resume_pdf_path: z.string().regex(/^\.\/(?:assets\/[^/\\]+|context\/resume)\.pdf$/i),
  questions: z.array(z.object({ match: z.array(z.string().min(1)).min(1), answer: z.string().min(1) })),
  skills_years: z.record(z.number().nonnegative()),
  eeo: z.record(z.string()),
  eeo_and_compliance_defaults: z.object({
    gender: z.string().default("Decline to self-identify"),
    ethnicity: z.string().default("Decline to self-identify"),
    veteran_status: z.string().default("Decline to self-identify"),
    disability_status: z.string().default("Prefer not to say"),
    referral_source: z.string().default("LinkedIn"),
    gdpr_privacy_consent: z.boolean().default(true),
  }).optional(),
});
export const Targets = z.object({ targets: z.array(z.object({
  name: z.string().min(1), platform: Platform, enabled: z.boolean(),
  url: z.string().url(), auth_check_url: z.string().url(),
  auth_required: z.boolean().default(true), max_results: z.number().int().min(1).max(100),
})) });
export function routeMatchScore(score: number, minimum = 7): "eligible" | "needs_review" | "skipped" {
  if (!Number.isFinite(score) || score < 0 || score > 10 || minimum < 7 || minimum > 10) throw new Error("Invalid score or minimum");
  return score >= minimum ? "eligible" : score >= 5 ? "needs_review" : "skipped";
}
export function applicationDecision(job: Pick<Application, "job_id" | "match_score" | "apply_type" | "open_questions">,
  apps: Application[], platform: string, today: string,
  limits: { dry_run: boolean; min_match_score: number; max_applications_per_day: number; max_per_platform: Record<string, number>; approval_mode?: "approve_before_submit" | "auto_high_confidence" | "dry_run" } & Partial<import("./runtime").RuntimeControls>,
  approval: { approved?: boolean; has_essay?: boolean } = {}) {
  if (apps.some(a => a.job_id === job.job_id)) return "duplicate";
  const route = routeMatchScore(job.match_score, limits.min_match_score);
  if (route !== "eligible") return route;
  if (job.apply_type === "manual_apply" || job.open_questions.length) return "needs_review";
  if (limits.active_hours && !withinActiveHours(new Date(), limits.active_hours)) return "outside_active_hours";
  const max = limits.warmup_mode ? effectiveDailyCap(limits.max_applications_per_day, limits.warmup_mode, today) : limits.max_applications_per_day;
  if (!canApply(apps, platform, today, {...limits,max_applications_per_day:max})) return "cap_reached";
  if (limits.dry_run || limits.approval_mode === "dry_run") return "dry_run";
  if (limits.approval_mode === "auto_high_confidence" && job.match_score >= 8 && !approval.has_essay) return "eligible";
  return approval.approved ? "eligible" : "approval_required";
}
