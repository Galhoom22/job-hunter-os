# Daily Run — v2

Trigger: owner explicitly starts or schedules a run in an authorized local agent environment. Read AGENTS.md, docs/execution-safety.md and pacing/snapshot/stop partials. Markdown does not launch a runner. New CV/setup requests use skills/00-onboarding-chat.md first, outside this run.

0. Mandatory: skills/00-interrogate-and-onboard.md. Audit all five gates; incomplete/stale/example data HARD BLOCKS the run and starts the focused interview. When complete show current mission briefing and wait for explicit launch confirmation. No browser run before consent.

1. Acquire `npm run run:lock -- acquire`; keep returned owner token for journal/release, never run two agents on one browser profile. Then `npm run preflight`; must exit 0. Failure: write schema-valid aborted run, validate, release owned lock, report and STOP. No browser actions first.
2. Auth verification: open each DISTINCT enabled platform's auth_check_url, pace/snapshot. For auth_required:true require an explicit account indicator. For public boards false logged-out is allowed. Any unexpected login, CAPTCHA, 2FA, warning or rate limit -> abort entire run and notify, never skip and continue.
3. Load owner profile, CV, preferences, targets, owner-verified form answers and guardrails. Use UTC YYYY-MM-DD for run ID/caps and ISO timestamps. Initialize DailyRun with all zero counts, running status, null finished_at and steps; validate. Do not overwrite an existing day's run: append steps/counts under the lock.
4. Retry at most 25 unsynced Notion records according to log-application.md, only AFTER steps 1–3. Sync errors remain local and do not trigger blind creation.
5. Each target uses discover-jobs.md and its platform/ATS playbook. For each canonical job check journal, score honestly, route below 5 skipped, 5 to below minimum review, >=7 eligible. Log every disposition.
6. Application loop: run applicationDecision from schemas/index.ts with max_applications_per_day lowered to agentDailyCap from schemas/agent-policy.ts using validated real runs. approval_required allows safe form preparation only, then approval-gate.md; never Submit. Missing platform cap, unknown facts, existing job or manual_apply overrides score. Re-read logs immediately before each submit. Count unresolved submission reservations against daily/platform caps. Stop when daily cap reached; skip capped platform.
7. Eligible internal forms use apply-easy-apply.md; external ATS apply-external-ats.md. Always run approval-gate.md and pass job-bound approval/essay context to applicationDecision before Submit. Reserve needs_review/submission_uncertain entry using npm run journal -- ENTRY_JSON_PATH LOCK_TOKEN; validate. Only after final receipt update SAME record to applied with applied_at; uncertainty stays review. Dry run never submits or reserves a submission.
8. End: counts derive from this run's actual journal dispositions; dry_run != applied. Finish JSON, validate, upsert Notion Daily Runs by run_id. Produce weekly/monthly report when due. Release owned lock in finally, including aborted paths. Report counts, review links/questions, errors and blockers. Never say applied without receipt or synced without confirmation.

Notion is optional: if storage_adapters.notion_mcp:false, skip sync and retry work entirely; keep local records/exports. If enabled, token/database access must be verified. Local JSON is always primary.

Before each action and Submit enforce warm-up effective cap, local active hours and 60s cooldown after max_consecutive_actions. Before eligible applications run skills/tailor-resume.md when enabled.


Run-date warm-up: inspect schema-valid real logs/runs/*.json (never demo). Count DISTINCT non-aborted authorized dates through today, including the current date once; do not count duplicate files, future dates or aborted preflight probes. On the first three such dates cap at 5 (or lower configured/calendar/platform cap). Afterwards retain existing progressive calendar warm-up and maximum; idle days alone cannot advance this gate. Set started_on once at the first authorized run with owner-approved setup, never reset it. Recompute agentDailyCap before every possible submission.

Read each complete JD for at least 10 seconds and longer as needed, in addition to 3–9-second action waits. Motivation drafts use grounded-answer.md; missing factual/legal answers remain blocking. These waits limit volume, not conceal automation or guarantee against restrictions. Never use stealth/bypass.
