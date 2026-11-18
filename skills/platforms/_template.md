---
name: platform-key
version: "1.1.0"
description: Load when an enabled target has platform PLATFORM and jobs must be discovered, read in full and routed to the right apply flow.
triggers:
  - target.platform == PLATFORM
requires_mcp:
  - playwright
preconditions:
  - run lock owned, preflight exit 0, auth verified, context loaded (daily-run steps 1-3)
  - PLATFORM target enabled with a real URL
requires_skills:
  - discover-jobs
  - score-job
verification:
  - each job has a stable PLATFORM:<posting id> or is routed to review
  - full description captured before scoring
  - apply flow chosen from the observed button with a snapshot
---
# PLATFORM playbook

## When to Use & Preconditions

Community template: fill every section with verified, live-tested details before enabling the target.

- **Load when:** target.platform == PLATFORM.
- **Preconditions (stop if any is false):**
  - run lock owned, preflight exit 0, auth verified, context loaded (daily-run steps 1-3)
  - PLATFORM target enabled with a real URL
- **Requires skills:** `discover-jobs`, `score-job`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

Live-tested: UNVERIFIED (replace only with genuine date, tool version and authorized evidence).

### Scope and identity
- Registry key / exact HTTPS hostname(s): fill in real values.
- Permitted automation/terms and limitations: document; never bypass security.
- Stable posting ID/canonical URL extraction from snapshot/actual link: specify; unknown → review.
- Auth requirement and observable named-account indicator: specify; public browsing only if target.auth_required:false.

### Search and reading
1. Enter confirmed role/location using current accessible labels/refs. Describe this board's distinctive filters and how to verify applied state, not fixed CSS selectors.
2. Open full JD, capture company/title/location/date/restrictions and stable identity; unknown remains unknown. Read for at least 10 seconds, score truthful fit and honor bounded results.
3. Check journal ID plus canonical ATS URL; preserve identity across redirects. Use 3–9s waits, active hours and cooldown.

### Form and hand-off
1. State whether Apply opens a draft, redirects, sends email or may submit in one click. Possible irreversible action requires final gate before click.
2. Fresh snapshot per step; exact verified per-job PDF; factual/legal unknowns → open_questions/screenshot/open tab/chat question. Motivation follows grounded-answer.md.
3. Recognized ATS → dispatcher; Workday/Taleo/unsupported/account creation → manual_apply + needs_review.
4. Dry run no Submit. Real gate, local owned lock/reservation, cap/dedup checks and receipt verification. Uncertainty never retries; security challenge/warning aborts whole run.
5. Local JSON first, optional Notion second. No secrets or private evidence in PRs.

### Contribution checklist
Add registry; docs-only boards use other with cap 0. Automatic submission needs contract key, disabled target example, explicit cap and meaningful safety tests. Document auth expiry, form changes, upload failure, missing facts and irreversible-label ambiguity. Never claim universal compatibility or anti-ban protection.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Claiming live-tested without evidence → ✅ keep UNVERIFIED.
- ❌ Enabling automatic submission without a reviewed adapter → ✅ cap 0.
- ❌ Using CSS selectors → ✅ roles, names and refs only.

### Self-verification check (before reporting this step complete)
- [ ] each job has a stable PLATFORM:<posting id> or is routed to review
- [ ] full description captured before scoring
- [ ] apply flow chosen from the observed button with a snapshot

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
