---
name: log-and-insights
version: "2.0.0"
description: Load whenever tracking or updating applications, writing skipped ghost/mismatch logs, daily run summaries, exporting reports, optional Notion MCP syncs, or /weekly-report insights; uses local JSON files as primary truth and Notion MCP optionally.
triggers:
  - track applications or update existing application record
  - write to logs/applications-log.json or logs/skipped-jobs.json
  - end of daily run summary
  - /weekly-report or export application report
requires_mcp:
  - none
optional_mcp:
  - notion
preconditions:
  - exact observed disposition and receipt (for applied) recorded
  - storage_adapters.notion_mcp checked in config/guardrails.yaml (skip Notion if false)
requires_skills:
  - meta-self-verification
verification:
  - logs/applications-log.json has unique job_id entries and applied_at set only when a receipt was observed
  - logs/runs/YYYY-MM-DD.json counts match actual journal dispositions (dry_run counted separately from applied)
  - Notion MCP writes (if enabled) used query-by-job_id-before-create and confirmed returned page IDs
---
# Local JSON Logging, Notion MCP Sync & Weekly Insights

## When to Use & Preconditions

Local JSON files under `logs/` are the single source of truth; Notion MCP is strictly optional (`storage_adapters.notion_mcp: false` by default). You write and maintain the JSON/Markdown logs directly with your IDE file tools—no external logging script is required.

- **Load when:** track applications or update an existing record; write to `logs/applications-log.json` or `logs/skipped-jobs.json`; end of daily run summary; `/weekly-report` or export application report.
- **Preconditions (stop if any is false):**
  - exact observed disposition and receipt (for `applied`) or owner-supplied status update recorded
  - `storage_adapters.notion_mcp` checked in `config/guardrails.yaml`
- **Requires skills:** `meta-self-verification`. **MCP:** none (`notion` optional).

## Deterministic Step-by-Step Execution

### 1. Maintain & Update `logs/applications-log.json` (Primary Truth)
Upsert entries by `job_id` (`"<platform>:<id>"`)—never append a second entry for the same `job_id`, and never overwrite an existing `applied` receipt:
- Allowed `status` values: `discovered | prepared | skipped | dry_run | applied | needs_review | failed | aborted` (plus outcome transitions such as `interview | assessment | offer | rejected | withdrawn` via `skills/12-recruiter-inbox-triage.md` or owner updates). Note: `prepared`, `discovered`, `dry_run`, `needs_review`, `skipped`, and `aborted` never count toward daily/warm-up `applied` caps.
- Allowed `apply_type` values: `easy_apply | external | manual_apply`.
- Required fields per entry: `job_id`, `title`, `company`, `platform`, `url`, `location`, `apply_type`, `discovered_at` (ISO UTC), `status`, `match_score` (0–10), `matched_skills[]`, `missing_skills[]`, `open_questions[]`, `screenshot` (path or `null`), `run_id` (`YYYY-MM-DD`), `applied_at` (ISO UTC or `null`), `notes`, `notion_synced` (`boolean`), `submission_uncertain` (`boolean`).
- **Application Prepared Without Submission:** When an application package (`resume.*`, cover letter, form answers, `interview-dossier.md`) is generated without submitting, record `status: "prepared"` (or `"needs_review"`), `applied_at: null`, and `notes` pointing to the artifact folder (`logs/resumes/<folder>/`).
- **Update Existing Record:** When the owner asks to update an existing application (e.g., `"Mark Acme Corp as interviewing"`), look up the matching `job_id`/company in `logs/applications-log.json`, preserve original `applied_at` and receipt quotes, update `status`/`notes`/`updated_at`, re-read the JSON file to verify validity, and confirm the exact diff.
- **Pre-submit reservation rule:** Before clicking live Submit, write `status: "needs_review"`, `submission_uncertain: true`, `applied_at: null`. Only after `skills/meta-self-verification.md` captures an explicit confirmation quote in `notes`, update the **same** entry to `status: "applied"`, `applied_at: <ISO>`, `submission_uncertain: false`.

### 2. Maintain `logs/skipped-jobs.json` & `logs/runs/YYYY-MM-DD.json`
- **Tier C & Ghost jobs (`logs/skipped-jobs.json`):** Record `job_id`, `platform`, `company`, `title`, `url`, `match_score`, `tier: "C"`, `reason` (`"ghost_or_expired"` | `"mismatch"` | `"dealbreaker"`), one-line `skip_reason` (<= 160 chars), `skipped_at` (ISO UTC), `run_id`.
- **Daily Run Summary (`logs/runs/YYYY-MM-DD.json`):** Record `run_id`, `started_at`, `finished_at`, `dry_run`, `status` (`running | completed | aborted`), `counts` (`scanned`, `applied`, `dry_run`, `needs_review`, `skipped`, `failed`), `platforms[]`, `errors[]`, `steps[]`, `notes`. Count `dry_run` separately from `applied`.

### 3. Optional Notion MCP Sync (`storage_adapters.notion_mcp: true`)
If disabled, skip this step completely. If enabled and `NOTION_TOKEN` + database IDs (`applications_db`, `daily_runs_db`, `insights_db`) in `context/preferences.yaml` are configured:
1. **Inspect database schema** via Notion MCP before writing.
2. **Query before create (Idempotency):** Search `Applications` by exact `job_id` (and `Daily Runs` by `run_id`). Update if 1 match exists; create once if 0 matches; mark for review if multiple.
3. Save `notion_page_id` and `notion_synced: true` ONLY after a confirmed Notion response with a page ID. On timeout or rate limit, keep `notion_synced: false` locally and retry next run (never lose local JSON records). Never upload raw resumes, screenshots, or secret tokens to Notion.

### 4. Weekly/Monthly Insights & Report Export (`/weekly-report`)
Aggregate all entries in `logs/applications-log.json` and `logs/skipped-jobs.json` for the requested period (`YYYY-Www`, `YYYY-MM`, or `all`):
- Compute `scanned`, `prepared`, `applied`, `match_rate`, `avg_match_score`, `top_skills[]`, `skill_gaps[]` (most frequent `missing_skills` across high-potential JDs), and actionable `recommendations[]`.
- Save JSON to `logs/insights/<type>-<period>.json` and, when exporting an application report, also write a clean Markdown (`logs/exports/applications-report-YYYY-MM-DD.md`) and/or CSV (`logs/exports/applications-report-YYYY-MM-DD.csv`) summary (plus `node ./bin/cli.mjs dashboard --no-open` for visual HTML Kanban). Re-read exported files to verify validity (`skills/meta-self-verification.md`). Sync Notion `Weekly & Monthly Insights` only if enabled.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Appending a duplicate record for the same `job_id` → ✅ always upsert by `job_id`.
- ❌ Counting `dry_run` jobs in the `applied` total → ✅ keep `dry_run` and `applied` counts strictly separate.
- ❌ Blindly re-creating a Notion page after a timeout → ✅ query by `job_id` first before creating.

### Self-verification check (before reporting this step complete)
- [ ] `logs/applications-log.json` has unique `job_id` entries and `applied_at` set only when a receipt was observed
- [ ] `logs/runs/YYYY-MM-DD.json` counts match actual journal dispositions (`dry_run` counted separately from `applied`)
- [ ] Notion MCP writes (if enabled) used query-by-`job_id`-before-create and confirmed returned page IDs
