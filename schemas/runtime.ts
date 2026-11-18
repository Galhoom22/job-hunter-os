import { z } from "zod";
export const StorageAdapters = z.object({ local_json: z.literal(true).default(true), notion_mcp: z.boolean().default(false), csv_export: z.boolean().default(true), markdown_report: z.boolean().default(true) });
export const RuntimeControls = z.object({
 tailor_resume_per_job: z.boolean().default(true),
 warmup_mode: z.object({ enabled: z.boolean(), started_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(), initial_cap: z.number().int().min(1).max(5), stage_days: z.number().int().min(3), increment: z.number().int().min(1).max(5) }).default({enabled:true,started_on:null,initial_cap:5,stage_days:3,increment:5}),
 active_hours: z.object({ start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), timezone: z.string().refine(v=>{try {new Intl.DateTimeFormat("en",{timeZone:v}); return true} catch{return false}},"Invalid timezone") }).default({start:"09:00",end:"20:00",timezone:"UTC"}),
 human_behavior: z.object({ action_delay_seconds: z.tuple([z.number().min(3).max(9),z.number().min(3).max(9)]).refine(([a,b])=>a<=b), scroll_jitter: z.boolean(), max_consecutive_actions: z.number().int().min(1).max(30), cooldown_seconds: z.number().int().min(60) }).default({action_delay_seconds:[3,9],scroll_jitter:false,max_consecutive_actions:15,cooldown_seconds:60}),
 storage_adapters: StorageAdapters.default({local_json:true,notion_mcp:false,csv_export:true,markdown_report:true}),
 // Two-phase triage: scan/score/pre-render a batch, show the Mission Control table, then wait for the owner's APPLY reply.
 workflow_mode: z.enum(["batch_review_first","direct_auto"]).default("batch_review_first"),
 batch_size: z.number().int().min(1).max(20).default(10),
 pregenerate_stretch_resumes: z.boolean().default(false),
});
export type RuntimeControls = z.infer<typeof RuntimeControls>;
export function effectiveDailyCap(max: number, warmup: RuntimeControls["warmup_mode"], today: string) {
 if(!warmup.enabled) return max;
 const elapsed=warmup.started_on ? Math.max(0,Math.floor((Date.parse(today)-Date.parse(warmup.started_on))/86400000)) : 0;
 return Math.min(max,warmup.initial_cap+Math.floor(elapsed/warmup.stage_days)*warmup.increment);
}
export function withinActiveHours(now: Date, hours: RuntimeControls["active_hours"]) {
 const parts=new Intl.DateTimeFormat("en-GB",{timeZone:hours.timezone,hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(now);
 const time=`${parts.find(p=>p.type==="hour")?.value}:${parts.find(p=>p.type==="minute")?.value}`;
 return hours.start<hours.end ? time>=hours.start&&time<hours.end : hours.start>hours.end ? time>=hours.start||time<hours.end : false;
}
