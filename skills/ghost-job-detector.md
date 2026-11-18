---
name: ghost-job-detector
version: "1.0.0"
description: Load when a job page is opened before scoring or tailoring; detects closed, expired, >30-day-old, or reposted ghost listings and logs them as skipped without wasting tokens.
triggers:
  - before scoring or tailoring a discovered job
  - job freshness / active status check
  - posting looks old or reposted
requires_mcp:
  - playwright
preconditions:
  - full job page loaded in browser with a fresh snapshot
  - run lock owned and context/preferences.yaml loaded
requires_skills:
  - log-application
verification:
  - active status, posting age (datePosted / visible age), and canonical ATS presence were checked before tailoring
  - closed, expired, or >30-day ghost postings were logged to logs/skipped-jobs.json with reason "ghost_or_expired"
  - no resume tailoring or form filling ran on a ghost or expired listing
---
# Ghost-Job & Live-Status Detector

## When to Use & Preconditions

Run immediately after expanding a job description and BEFORE investing tokens in `skills/tailor-resume.md` or filling any form.

- **Load when:** before scoring or tailoring a discovered job; job freshness / active status check; posting looks old or reposted.
- **Preconditions (stop if any is false):**
  - full job page loaded in browser with a fresh snapshot
  - run lock owned and `context/preferences.yaml` loaded
- **Requires skills:** `log-application`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

1. **Inspect closed/expired indicators in the fresh snapshot:**
   - Look for banners or disabled controls saying: `"No longer accepting applications"`, `"This job is closed"`, `"Position filled"`, `"Job expired"`, `"Posting not found"`, or HTTP 404/410 empty states.
   - If any closed/filled/expired indicator is observed, stop immediately and mark `ghost_or_expired`.
2. **Check `datePosted` and posting age:**
   - Read visible posting age (`"Posted X days ago"`, `"Reposted"`, `"30+ days ago"`) AND inspect JSON-LD / `<meta>` `datePosted` / `validThrough` when exposed on the page.
   - If `validThrough` is in the past, stop as `ghost_or_expired`.
   - If `datePosted` is older than **30 days** (or the max age configured in `context/preferences.yaml`), warn or skip as stale/ghost (`ghost_or_expired`) unless the canonical employer ATS confirms an active hiring window.
   - Flag reposted-ghost signals (e.g., LinkedIn `"Reposted X weeks ago"` combined with `"Over 100 applicants"` or identical role cycling >30 days).
3. **Verify canonical employer ATS presence (for aggregator links):**
   - When a board (Indeed, LinkedIn external link, RemoteOK, BuiltIn, Glassdoor) points to an employer ATS (`boards.greenhouse.io`, `job-boards.greenhouse.io`, `jobs.lever.co`, `jobs.ashbyhq.com`), verify the canonical ATS URL still loads an active job form before tailoring.
   - If the aggregator lists the job as open but the canonical ATS returns `"Sorry, this job is closed"` or redirects to a generic careers root with no matching role, classify as `ghost_or_expired`.
4. **Log ghost/expired jobs cleanly:**
   - Append a Tier C record to `logs/skipped-jobs.json` with `reason: "ghost_or_expired"`, `tier: "C"`, `match_score: 0` (or observed score), and single-line `skip_reason` (e.g., `"ghost_or_expired: Closed banner observed on Greenhouse"` or `"ghost_or_expired: datePosted > 30 days ago (2026-09-10)"`).
   - Record the matching `skipped` entry in `logs/applications-log.json` via `npm run journal` and run `npm run validate:logs`.
5. **Pass active postings forward:**
   - Only when active status, freshness (<= 30 days or verified open on ATS), and canonical presence are confirmed, proceed to `skills/score-job.md` and `skills/tailor-resume.md`.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Tailoring a full resume before checking whether `"No longer accepting applications"` is on the page → ✅ check live status first.
- ❌ Treating `"Reposted 2 days ago"` on a 90-day-old requisition as fresh without checking the employer ATS → ✅ check `datePosted` and canonical ATS status.
- ❌ Logging a ghost job only in chat without updating `logs/skipped-jobs.json` → ✅ log with `reason: "ghost_or_expired"` so the next run does not re-scan it.

### Self-verification check (before reporting this step complete)
- [ ] active status, posting age (`datePosted` / visible age), and canonical ATS presence were checked before tailoring
- [ ] closed, expired, or >30-day ghost postings were logged to `logs/skipped-jobs.json` with `reason: "ghost_or_expired"`
- [ ] no resume tailoring or form filling ran on a ghost or expired listing

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
