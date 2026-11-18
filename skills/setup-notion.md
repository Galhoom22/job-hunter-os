---
name: setup-notion
description: Provision optional job tracking in Notion after the owner opts in and shares a parent page with the MCP integration.
---
# Optional Notion provisioning

Local JSON stays primary. Ask for the parent-page link/ID and explicit permission to create the three trackers; explain which fields leave the machine. The owner authorizes the integration through their IDE's secure connection flow or stores NOTION_TOKEN locally outside Git/chat. Never print or inspect secret values in output.

1. Discover actual Notion MCP methods and API schemas. Retrieve the approved parent and confirm access. Use database vs data-source APIs as exposed; do not hardcode an outdated endpoint or tool name.
2. Search within that parent for exact titles **Applications**, **Daily Runs**, **Weekly & Monthly Insights**. Retrieve matching schemas. One suitable tracker → reuse; none → create once with owner permission; multiple/ambiguous → ask. Do not alter unrelated databases.
3. Create/verify properties below using current tool argument types. A Notion database has one title property. Add missing properties only with permission; report incompatible existing types rather than destructive replacement.

| Tracker | Stable key and properties |
|---|---|
| Applications | Job title (title); Job ID (rich text); Company (rich text); Platform (select); Status (select: discovered, skipped, dry_run, applied, needs_review, failed, aborted); Match Score (number); Missing Skills (multi-select); URL (url); Applied At (date) |
| Daily Runs | Run ID (title: UTC YYYY-MM-DD); Date (date); Scanned, Applied, Dry Run Count, Needs Review, Skipped, Failed (numbers); Dry Run (checkbox); Status (select); Errors, Notes (rich text) |
| Weekly & Monthly Insights | Period Key (title: type + period); Period (rich text); Type (select: weekly, monthly); Scanned, Applied, Match Rate, Average Match Score (numbers); Top Skills, Skill Gaps, Recommendations (rich text) |

4. Read back all three trackers and their property types. Query by a unique synthetic setup-probe key, create a non-personal probe in the approved Applications tracker, read it back, then archive it; never report live sync verified from search alone. If creation times out, query that key before retrying; duplicates/uncertainty require review. Any failed read-back leaves Notion disabled.
5. Record returned tracker IDs in private `context/preferences.yaml` under notion.applications_db, daily_runs_db, insights_db. If the API distinguishes database and data-source IDs, retain the returned data-source mapping in a private context note and resolve it when syncing; do not swap ID types blindly.
6. Only after success set storage_adapters.notion_mcp:true, regenerate local configs as needed, and report verified tracking. Failed/declined setup retains local-only mode without blocking onboarding. For later outages keep unsynced JSON and follow log-application.md query-before-create retries.

Never sync CV PDFs, screenshots, contact details or legal/EEO answers without separate informed approval. A Notion connection is not a guarantee that all future writes will succeed.
