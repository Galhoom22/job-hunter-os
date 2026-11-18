# Local Journal & Notion Sync — v2

1. Local JSON is the source of truth; use schemas/index.ts Application contract. Allowed statuses: discovered, skipped, dry_run, applied, needs_review, failed, aborted. manual_apply is apply_type only.
2. Under the owned run lock, write an entry JSON locally and use `npm run journal -- ENTRY_JSON_PATH LOCK_TOKEN`. It validates and atomically upserts applications-log.json by job_id, never appends a duplicate or overwrites an applied receipt. Run npm run validate:logs after EACH JSON write including run/insight updates.
3. Before submission reserve needs_review with submission_uncertain:true, applied_at:null. After verified receipt update SAME entry to applied with timestamp and uncertainty false. Unconfirmed submission is never retried automatically. Failed/discovered entries are not silently resubmitted either; owner review required.
4. Read preferences.notion IDs: applications_db, daily_runs_db, insights_db. Use Notion MCP discovery to inspect current database/data-source schema and map actual properties; missing IDs/access/schema -> local unsynced record and reported blocker, not made-up IDs.
5. Applications map title/company/platform/status/match score/missing skills/URL/applied date/job_id. Query target database for exact Job ID first. Existing page -> update; none -> create once. Save returned notion_page_id and notion_synced:true ONLY after confirmed response. Multiple matches -> review.
6. Timeout/create uncertainty -> notion_synced:false and run error. On retry, QUERY first using stable job_id, never create blindly. At start of next run after auth/context, retry up to 25 unsynced items once each; bounded backoff for rate limits, then defer. Notion failures do not erase local records.
7. Daily Runs: upsert by run_id/date, save counts including dry_run separately, errors and notes. Query before create on retries; never count dry runs as applied.
8. Insights: upsert by type + period, retain notion_synced:false on failure. No screenshots/resumes/contact data or full private form answers to Notion unless separately approved. Never print tokens or generated MCP contents.

Notion is optional: if storage_adapters.notion_mcp:false, skip sync and retry work entirely; keep local records/exports. If enabled, token/database access must be verified. Local JSON is always primary.
