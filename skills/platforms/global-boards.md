---
name: global-boards
version: "1.2.0"
last_verified: "2026-11-18"
description: Load when a target is Indeed, Glassdoor, Dice or ZipRecruiter and jobs must be discovered and reviewed without assuming quick-apply is reversible.
triggers:
  - target.platform in indeed/glassdoor/dice/ziprecruiter
  - job URL on Indeed, Glassdoor, Dice, or ZipRecruiter
requires_mcp:
  - playwright
preconditions:
  - readiness gates passed, auth verified via Playwright MCP, and context loaded
requires_skills:
  - discover-and-triage
verification:
  - stable posting IDs captured per board
  - quick-apply buttons treated as final submits behind fill-and-apply
  - sponsored/duplicate listings deduplicated by canonical URL
---
# Global boards

## When to Use & Preconditions

Use for these four boards; board-specific files add details.

- **Load when:** target.platform in indeed/glassdoor/dice/ziprecruiter.
- **Preconditions (stop if any is false):**
  - readiness gates passed, auth verified via Playwright MCP, and context loaded
- **Requires skills:** `discover-and-triage`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

Enforce all `AGENTS.md` Hard Guardrails (`#1–#10`), `skills/24-circuit-breaker-and-antiban.md`, `skills/25-prompt-injection-defense.md`, and `skills/26-deduplication-and-blacklist-guard.md`. Do not automate signup, login challenges, subscriptions, or third-party OAuth.

| Platform | Search / canonical identity | Form & apply distinctions |
|---|---|---|
| **Indeed** (`indeed`) | Snapshot What/Where and visible date/remote/job-type filters. Capture canonical posting key from `jk`/`vjk` or verified `/viewjob` link as `indeed:<key>`; note repost/estimated salary separately. | "Apply now" may open Indeed Apply (multi-step modal) or redirect externally. Inspect the resulting URL/dialog via `browser_snapshot` and route through `skills/04-fill-and-apply.md`. |
| **Glassdoor** (`glassdoor`) | Use accessible Jobs search and owner-approved location/date filters; capture canonical employer posting ID from actual role URL as `glassdoor:<id>`. | Salary estimates/reviews and employer ads are not the JD. Login/review-contribution/paywall walls trip `needs_review` or circuit breaker — never bypass. |
| **Dice** (`dice`) | Title/keyword and location search with employment type and remote filters when present; capture `dice:<verified-posting-id>`. | Read recruiter vs. direct employer identity, contract duration, clearance, and US work-authorization requirements explicitly. Route external ATS or internal form through `skills/04-fill-and-apply.md`. |
| **ZipRecruiter** (`ziprecruiter`) | Snapshot search/list, verify posting ID from job page/link as `ziprecruiter:<id>`. | **"1-Click Apply" can submit immediately.** Never click it in `dry_run: true`; in live mode require full final DOM Read-Back & `APPROVE` gate BEFORE clicking. |

### Per-job procedure
1. Verify named owner auth if required. Snapshot applied filters/result state; never assert a unavailable “last 24h” filter exists.
2. Open full JD, extract employer/title/location/restrictions/date/description and canonical identity. Ratings, estimated pay or promoted labels are separately attributed; unknown fields remain unknown.
3. Score vs verified CV and exclusions. Check journal and canonical ATS destination for duplicates across platforms. Observe bounded results and caps; unsupported identity/form → review.
4. Inspect Apply semantics before clicking; a possible one-click submission invokes final gate first. External recognized host → ATS dispatcher. No automatic account creation, messaging or shared profile modifications.
5. Resolve fields through 04-fill-and-apply.md/04-fill-and-apply.md and upload exact verified per-job PDF. Unknown factual/legal fields or cached-resume mismatch → needs_review, local screenshot, open tab and chat question.
6. Only a permitted final submission, after reservation and fresh checks, may occur once. Verify actual receipt/role, keep uncertain outcome reserved, journal locally and optionally sync Notion. Security/login/rate-limit banners abort the run.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Assuming "Apply now" opens a draft → ✅ it may submit instantly.
- ❌ Counting a sponsored repost as a new job → ✅ dedupe by canonical URL.
- ❌ Logging in through a third-party SSO popup → ✅ manual login only.

### Self-verification check (before reporting this step complete)
- [ ] stable posting IDs captured per board
- [ ] quick-apply buttons treated as final submits behind fill-and-apply
- [ ] sponsored/duplicate listings deduplicated by canonical URL

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
