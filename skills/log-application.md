# Skill: Log Application (local JSON + Notion) — v1

## 1. Local first (source of truth)
Append to `logs/applications-log.json` (array) an `Application` object:
```json
{ "job_id": "linkedin:4012345678", "title": "", "company": "", "platform": "linkedin", "url": "",
  "location": "", "status": "applied", "match_score": 8.2, "matched_skills": [], "missing_skills": [],
  "apply_type": "easy_apply", "open_questions": [], "screenshot": null, "run_id": "2026-11-18",
  "discovered_at": "ISO", "applied_at": "ISO|null", "notes": "", "notion_synced": false }
```
Run `npm run validate:logs`. Fix and rewrite if it fails.

## 2. Notion sync
Using Notion MCP, create a page in the **Applications** database (`preferences.yaml -> notion.applications_db`)
mapping fields per `mcp/README.md`. On success set `notion_synced: true` in the local entry.
On any error: leave `notion_synced: false`, add the error to the run's `errors`, continue (do not retry in a loop).

## 3. Retry pass
At the start of every daily run (after preflight), sync up to 25 entries with `notion_synced: false`.

## 4. Daily Runs row
At the end of the run, create a **Daily Runs** page with the counts from `logs/runs/<RUN_ID>.json`.
