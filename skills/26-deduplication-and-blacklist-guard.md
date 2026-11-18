---
name: deduplication-and-blacklist-guard
version: "1.0.0"
description: Load during discovery and before tailoring or filling any application to block blacklisted employers/domains in context/preferences.yaml and enforce cross-channel canonical job fingerprinting (company::role_title) against logs/applications-log.json so the same job is never applied to twice across LinkedIn, Wellfound, and direct ATS boards.
triggers:
  - check job for duplicate or blacklisted employer
  - cross-channel deduplication check
  - verify company against blacklisted_companies and blacklisted_domains
requires_mcp:
  - none
preconditions:
  - context/preferences.yaml, logs/applications-log.json, and logs/skipped-jobs.json are readable
  - candidate job posting company name, role title, and URL/domain are extracted
requires_skills:
  - discover-and-triage
  - log-and-insights
verification:
  - company name and destination domain were checked against blacklisted_companies and blacklisted_domains in context/preferences.yaml (case-insensitive substring and domain match)
  - canonical fingerprint normalize(company) + "::" + normalize(role_title) plus canonical URL/job_id were checked against logs/applications-log.json before tailoring or opening any form
  - any matched duplicate or blacklisted posting was skipped cleanly and logged to logs/skipped-jobs.json with reason duplicate_cross_channel or blacklisted_employer
---
# Cross-Channel Deduplication & Employer Blacklist Guard

## When to Use & Preconditions

Prevents two high-cost job-hunting disasters: (1) accidentally sending an application to the owner's current employer, a toxic former workplace, or a blacklisted staffing agency, and (2) double-applying to the exact same requisition listed simultaneously on LinkedIn, Wellfound, Wuzzuf, and the company's Greenhouse/Lever board.

- **Load when:** `check job for duplicate or blacklisted employer`; `cross-channel deduplication check`; `verify company against blacklisted_companies and blacklisted_domains`.
- **Preconditions (stop if any is false):**
  - `context/preferences.yaml`, `logs/applications-log.json`, and `logs/skipped-jobs.json` are readable
  - posting company name, role title, and URL/domain are known
- **Requires skills:** `discover-and-triage`, `log-and-insights`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **Employer & Domain Blacklist Check (`context/preferences.yaml`):**
   - Read `blacklisted_companies` (and legacy alias `blacklist_companies`) plus `blacklisted_domains` from `context/preferences.yaml`.
   - Also check if the owner's *current active employer* in `context/cv.md` (`Present` / `Current`) matches the hiring company (unless the owner explicitly requested an internal transfer).
   - Compare case-insensitively against:
     - Posted company name and parent brand mentioned in the JD (`"A subsidiary of X"`).
     - External application URL hostname and any recruiter email domain in the JD.
   - If matched: immediately mark `🔴 Skipped (Blacklisted Employer/Domain)` in Mission Control and record in `logs/skipped-jobs.json` with `reason: "blacklisted_employer"`.
2. **Compute Canonical Cross-Channel Fingerprint:**
   - Normalize `company`: lowercase, strip legal suffixes (`inc`, `llc`, `ltd`, `gmbh`, `corp`, `co`, `technologies`, `labs`), strip punctuation, and collapse whitespace.
   - Normalize `role_title`: lowercase, expand common abbreviations (`sr.` -> `senior`, `jr.` -> `junior`, `eng` -> `engineer`, `fullstack` / `full stack` -> `full-stack`, `fe` -> `frontend`, `be` -> `backend`), strip trailing location/work-mode parentheticals (`(remote)`, `- EMEA`, `(m/f/d)`), and collapse whitespace.
   - Construct canonical key: `fingerprint = "<normalized_company>::<normalized_role_title>"`.
3. **Cross-Check Against `logs/applications-log.json` & Active Batch:**
   - Scan all entries in `logs/applications-log.json` (plus earlier items in the current discovery batch) for:
     1. Exact `job_id` or canonical URL match (stripping `utm_*`, `refId`, `trackingId`, `gh_jid` query noise).
     2. Matching `fingerprint` (`normalize(company) + "::" + normalize(role_title)`) applied within the last **60 days** on ANY platform (e.g., applied via `linkedin` Easy Apply on Monday, discovered on `greenhouse` or `wellfound` on Wednesday).
   - If a match exists with status `applied`, `submission_uncertain`, `interview`, `assessment`, or `offer`:
     - Skip the duplicate immediately, log to `logs/skipped-jobs.json` (`reason: "duplicate_cross_channel"`, `matched_job_id`), and label it in Mission Control (`⚪ Duplicate — Already applied via <platform> on <date>`).

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

- **NEVER** rely solely on platform-specific `job_id` (e.g., `linkedin-123` vs. `greenhouse-456`) to detect duplicates—always check `normalize(company)::normalize(role_title)` as well.
- **NEVER** apply to the owner's current `"Present"` employer from `context/cv.md` or any entry in `blacklisted_companies` / `blacklisted_domains`.
- **NEVER** re-tailor a PDF for a role that already has an active `applied` or `submission_uncertain` record.
- **Self-Verification Check:** Confirm `blacklisted_companies`, `blacklisted_domains`, current employer, canonical URL, and `company::role_title` fingerprint were all verified against `logs/applications-log.json` before tailoring or form filling.
