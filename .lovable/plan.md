# Build Plan: Portable AI Job Hunter Repository

This builds the approved blueprint from your specs, in four batches. Batches 1 and 2 come first, then batches 3 and 4.

## Batch 1: Agent entrypoints, IDE workflows, MCP configs
- `AGENTS.md` sets the agent's identity and fixes the run order: Preflight -> Auth -> Context -> Discover -> Score -> Apply -> Log -> Report. It also holds the hard guardrails:
  - The agent never invents form answers. It marks the job `needs_review` and takes a screenshot.
  - The agent waits a random 3–8 seconds between actions.
  - LinkedIn changes always need your approval first.
  - The agent respects the daily caps.
- IDE entry files: `.agent/workflows/daily-run.md` (with frontmatter), `.cursor/rules/job-hunter.mdc` and `CLAUDE.md`. All three point to `AGENTS.md`.
- `mcp/mcp.template.json` sets up two connections:
  - Playwright MCP with `--user-data-dir=./browser-profile`
  - Notion MCP using `NOTION_TOKEN`
- `mcp/README.md` explains how to log in once to Google and LinkedIn, and how to connect Notion.

## Batch 2: Skills (`skills/*.md`)
- Skills: `00-daily-run`, `discover-jobs`, `score-job`, `apply-easy-apply`, `apply-external-ats`, `fill-form-answers`, `log-application`, `weekly-insights`, `linkedin-profile-update`, `linkedin-post`.
- The playbooks find page elements by their accessibility labels, not by CSS selectors. That way they keep working when a site's layout changes.
- They also cover:
  - Skipping jobs already in the log (matched by `job_id`)
  - Dry-run mode
  - Stopping on a CAPTCHA or a login wall
  - Keeping your Notion databases in sync (Applications, Daily Runs, Weekly & Monthly Insights), with `notion_synced: false` marking rows to retry later

## Batch 3: Context, guardrails, schemas, scripts
- `context/` gets example files (`profile.md`, `preferences.yaml`, `targets.yaml`, `form-answers.yaml`) plus working starter copies.
- `targets.yaml` comes with sample search links for LinkedIn, Wellfound, Wuzzuf and Greenhouse.
- `.gitignore` keeps the browser profile, `.env`, the MCP config files and your real logs out of GitHub.
- `config/guardrails.yaml`:
  - `dry_run: true`
  - `max_applications_per_day: 20`
  - Per platform: LinkedIn 12, Wellfound 5, Wuzzuf 5
  - `min_match_score: 7`
  - Delay of 3–8 seconds
- `schemas/` defines the shape of three records (Application, DailyRun, DiscoveredJob), written once and shared by the scripts and the dashboard.
- `scripts/`:
  - `sync-mcp.ts` copies the MCP template into each IDE's config file.
  - `validate-logs.ts` checks the logs against the schemas.
  - `preflight.ts` checks everything is ready before a run.
- New `npm` commands to run each script.

## Batch 4: Local dark-mode dashboard
- **Overview (`/`):** cards for total scanned, applied, average match score and pending review, plus a bar chart by platform and a daily trend line.
- **`/applications`:** a table you can filter, with status badges, missing-skill tags and links to each job.
- **`/runs`:** a journal of each daily run.
- **`/config`:** edit `targets.yaml` and `form-answers.yaml`, and switch `dry_run` on or off. Changes are saved straight to the files on your machine.
- **`/insights`:** the skills employers ask for most compared with gaps in your CV, plus the weekly and monthly reports.
- `logs/applications-log.json` and `logs/runs/` come with realistic demo data, so the dashboard looks full the first time you open it.

## Technical notes
- The dashboard reads and writes `logs/`, `context/` and `config/` through local server functions using Node's filesystem module. This only works on your machine with `npm run dev`. The hosted preview falls back to the bundled demo data.
- New libraries: `recharts`, `zod`, `yaml` and `tsx` (to run the scripts).
- Design: dark-only colors set in `src/styles.css`, Space Grotesk headings with a mono font for data, and a distinct accent color.
- Every page gets its own title and description.
