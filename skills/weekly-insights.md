---
name: weekly-insights
version: "2.1.0"
description: Load when a weekly or monthly market/skill-gap report is due or requested (/weekly-report); computes counts from the validated local journal and writes JSON + Markdown reports.
triggers:
  - /weekly-report
  - Monday after a completed run
  - first day of month
requires_mcp:
  - none
preconditions:
  - validated logs/applications-log.json
  - owned run lock for report writes
requires_skills:
  - log-application
verification:
  - npm run insights exited 0 and validate:logs exits 0
  - every count states its denominator and sample size
  - applied counts include only confirmed receipts
---
# Weekly & Monthly Market / Skill-Gap Reports

## When to Use & Preconditions

Use for reporting only; no browser actions needed.

- **Load when:** /weekly-report; Monday after a completed run; first day of month.
- **Preconditions (stop if any is false):**
  - validated logs/applications-log.json
  - owned run lock for report writes
- **Requires skills:** `log-application`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. Load validated local ApplicationsLog; use UTC calendar week (Monday–Sunday) or calendar month, explicitly record period (YYYY-Www / YYYY-MM), count each job_id once. Exclude synthetic demo, outside-period entries and duplicate canonical ATS roles.
2. scanned = unique scored jobs; applied = confirmed applied receipts only; needs_review and dry_run separately. match_rate = jobs with match_score >= min_match_score / scanned (0 if empty), NOT applications/scanned. avg_match_score = mean scored values (0 if empty).
3. Demand count each skill once per job in matched_skills union missing_skills. Gaps count missing skills once per job. Compute platform and location breakdown, sample size and uncertain salary coverage; do not infer whole-market trends from sparse sample.
4. Write 3–5 concrete CV/learning recommendations with measured counts/denominators; never invent experience or claim a skill exists in CV. Include limitations in recommendations if sample is sparse.
5. Save schema-valid logs/insights/<type>-<period>.json atomically with notion_synced:false; validate immediately. Query Notion insights_db by Type + Period before create/update; on confirmed success persist page_id and synced true, validate again.
6. Failed sync follows log-application.md bounded retry (query before create); local report is retained. Weekly reports run Monday after completed daily run; monthly reports on first day for prior complete month. Manual requests may specify a partial period explicitly. Report counts, skill gaps and limitations honestly.

Use `npm run insights -- weekly|monthly PERIOD START_ISO END_ISO LOCK_TOKEN` for the shared schema-backed calculator and atomic local report writer. Bounds are inclusive start, exclusive end; choose UTC calendar bounds. Then perform Notion upsert through MCP.

Notion is optional: if storage_adapters.notion_mcp:false, skip sync and retry work entirely; keep local records/exports. If enabled, token/database access must be verified. Local JSON is always primary.


For /weekly-report always write a private human-readable logs/insights/weekly-<period>.md alongside the validated JSON: period/bounds, sample size, unique scored jobs, confirmed applied, review/dry-run counts, skill demand/gaps with denominators, 3–5 evidence-based recommendations and limitations. Never copy demo facts into a real report. Optional Notion failure does not erase Markdown. Acquire/release the local owned lock for report writes; no browser application needed.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Calling match_rate applications/scanned → ✅ it is jobs >= min score / scanned.
- ❌ Recommending a skill as if the owner has it → ✅ recommendations never invent experience.
- ❌ Drawing market trends from 6 jobs → ✅ state the limitation.

### Self-verification check (before reporting this step complete)
- [ ] npm run insights exited 0 and validate:logs exits 0
- [ ] every count states its denominator and sample size
- [ ] applied counts include only confirmed receipts

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
