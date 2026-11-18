# Weekly & Monthly Market / Skill-Gap Reports — v2

1. Load validated local ApplicationsLog; use UTC calendar week (Monday–Sunday) or calendar month, explicitly record period (YYYY-Www / YYYY-MM), count each job_id once. Exclude synthetic demo, outside-period entries and duplicate canonical ATS roles.
2. scanned = unique scored jobs; applied = confirmed applied receipts only; needs_review and dry_run separately. match_rate = jobs with match_score >= min_match_score / scanned (0 if empty), NOT applications/scanned. avg_match_score = mean scored values (0 if empty).
3. Demand count each skill once per job in matched_skills union missing_skills. Gaps count missing skills once per job. Compute platform and location breakdown, sample size and uncertain salary coverage; do not infer whole-market trends from sparse sample.
4. Write 3–5 concrete CV/learning recommendations with measured counts/denominators; never invent experience or claim a skill exists in CV. Include limitations in recommendations if sample is sparse.
5. Save schema-valid logs/insights/<type>-<period>.json atomically with notion_synced:false; validate immediately. Query Notion insights_db by Type + Period before create/update; on confirmed success persist page_id and synced true, validate again.
6. Failed sync follows log-application.md bounded retry (query before create); local report is retained. Weekly reports run Monday after completed daily run; monthly reports on first day for prior complete month. Manual requests may specify a partial period explicitly. Report counts, skill gaps and limitations honestly.

Use `npm run insights -- weekly|monthly PERIOD START_ISO END_ISO LOCK_TOKEN` for the shared schema-backed calculator and atomic local report writer. Bounds are inclusive start, exclusive end; choose UTC calendar bounds. Then perform Notion upsert through MCP.
