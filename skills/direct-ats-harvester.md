---
name: direct-ats-harvester
version: "1.0.0"
description: Load when discovering jobs directly from public Greenhouse, Lever, or Ashby JSON feeds via `pull-ats`; fetches structured postings in seconds, filters by role/location locally, and feeds matching URLs into triage without browser scraping.
triggers:
  - /daily-run fast ATS pull
  - pull-ats
  - harvest Greenhouse / Lever / Ashby company boards
requires_mcp:
  - none
preconditions:
  - target board_tokens configured in context/targets.yaml or passed via --board <ats>:<token>
  - owner-confirmed role/location keywords in context/preferences.yaml or CLI flags
requires_skills:
  - ghost-job-detector
  - score-job
  - discover-and-triage
verification:
  - node bin/job-hunter.mjs pull-ats exited 0 and wrote logs/ats-harvest.json
  - harvested URLs come only from allowlisted Greenhouse, Lever, or Ashby public JSON APIs
  - matching jobs are deduplicated against logs/applications-log.json before scoring or opening
---
# Fast Direct ATS JSON Feed Harvester

## When to Use & Preconditions

Use when target companies host public job boards on **Greenhouse**, **Lever**, or **Ashby**. Instead of slow browser search pagination, `pull-ats` queries official public JSON endpoints in seconds and feeds clean URLs into `skills/discover-and-triage.md`.

- **Load when:** `/daily-run` fast ATS pull; `pull-ats`; harvest Greenhouse / Lever / Ashby company boards.
- **Preconditions (stop if any is false):**
  - target `board_tokens` configured in `context/targets.yaml` or passed via `--board <ats>:<token>`
  - owner-confirmed role/location keywords in `context/preferences.yaml` or CLI flags
- **Requires skills:** `ghost-job-detector`, `score-job`, `discover-and-triage`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **Configure target boards in `context/targets.yaml` (or pass `--board`):**
   - Add employer slugs under `board_tokens` on the `greenhouse`, `lever`, or `ashby` target entries in `context/targets.yaml` (and enable the target when approved), or supply `--board greenhouse:<token>` / `--board lever:<token>` / `--board ashby:<token>`.
   - Supported public JSON endpoints (read-only GET):
     - Greenhouse: `https://boards-api.greenhouse.io/v1/boards/<board_token>/jobs?content=true`
     - Lever: `https://api.lever.co/v0/postings/<company>?mode=json`
     - Ashby: `https://api.ashbyhq.com/posting-api/job-board/<board_name>`
2. **Run `pull-ats` from the agent home:**
   ```bash
   node bin/job-hunter.mjs pull-ats
   ```
   Optional filters:
   - `--board greenhouse:stripe --board lever:figma` (one-off board queries)
   - `--role "Frontend Engineer" --location "Remote"` (override `context/preferences.yaml` filters)
   - `--all` (include configured `board_tokens` on disabled ATS entries for read-only discovery preview)
   - `--limit 25` (cap total harvested matches)
3. **Inspect `logs/ats-harvest.json` and feed into triage:**
   - Read `logs/ats-harvest.json`, filter out any `job_id` or `url` already present in `logs/applications-log.json` or `logs/skipped-jobs.json`.
   - For each new candidate URL, run `skills/ghost-job-detector.md` (check `posted_at` <= 30 days and live page), then `skills/score-job.md` and `skills/discover-and-triage.md` (Mission Control table before any Apply click).
4. **Apply with normal safety gates:**
   - Harvesting a URL does NOT grant apply permission: `apply-external-ats.md`, `approval-gate.md`, caps, warm-up, active hours, and `dry_run` still govern every application.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Fetching arbitrary user-supplied URLs outside the three allowlisted ATS API hosts → ✅ `bin/ats-harvester.mjs` allows only Greenhouse, Lever, and Ashby endpoints.
- ❌ Auto-applying to harvested URLs without Mission Control triage or `approval-gate.md` → ✅ `pull-ats` only feeds discovery/triage.
- ❌ Re-scoring `job_id`s already in `logs/applications-log.json` → ✅ deduplicate first.

### Self-verification check (before reporting this step complete)
- [ ] `node bin/job-hunter.mjs pull-ats` exited 0 and wrote `logs/ats-harvest.json`
- [ ] harvested URLs come only from allowlisted Greenhouse, Lever, or Ashby public JSON APIs
- [ ] matching jobs are deduplicated against `logs/applications-log.json` before scoring or opening

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
