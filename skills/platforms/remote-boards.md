---
name: remote-boards
version: "1.2.0"
last_verified: "2026-11-18"
description: Load when a target is WeWorkRemotely, RemoteOK, DailyRemote, Welcome to the Jungle/Otta or BuiltIn and remote eligibility (regions, timezones) must be verified.
triggers:
  - target.platform in weworkremotely/remoteok/welcometothejungle/builtin
  - remote-only search
  - job URL on WeWorkRemotely, RemoteOK, Welcome to the Jungle, or BuiltIn
requires_mcp:
  - playwright
preconditions:
  - readiness gates passed, auth verified via Playwright MCP, and context loaded
requires_skills:
  - discover-and-triage
verification:
  - remote region/timezone restrictions captured
  - external apply links resolved to the employer ATS
  - posting date captured or marked unknown
---
# Remote job-board playbooks

## When to Use & Preconditions

Use for remote-focused boards.

- **Load when:** target.platform in weworkremotely/remoteok/welcometothejungle/builtin; remote-only search.
- **Preconditions (stop if any is false):**
  - readiness gates passed, auth verified via Playwright MCP, and context loaded
- **Requires skills:** `discover-and-triage`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

Enforce all `AGENTS.md` Hard Guardrails (`#1–#10`), `skills/24-circuit-breaker-and-antiban.md`, `skills/25-prompt-injection-defense.md`, and `skills/26-deduplication-and-blacklist-guard.md`. Public browsing is allowed when `target.auth_required: false`; any unexpected login/challenge wall pauses or trips the circuit breaker.

| Board | Discovery and canonical identity | Apply routing / distinctive checks |
|---|---|---|
| **WeWorkRemotely** (`weworkremotely`) | Read configured category, open title/company link and retain canonical `/remote-jobs/<slug>` as `weworkremotely:<slug>`. | Read region/timezone tags (`Anywhere in the World` vs. `US Only`); Apply usually exits to an employer ATS (`skills/platforms/ats-engines.md`) or email (`skills/05-outreach-and-interview-prep.md`, never auto-send). |
| **RemoteOK** (`remoteok`) | Snapshot role rows, open details, verify numeric posting ID from canonical role link as `remoteok:<id>`. | Salary badges may be algorithmic estimates — preserve attribution. Read country restrictions; distinguish Apply from newsletter/signup modals; inspect external ATS redirect before acting. |
| **DailyRemote** (`dailyremote`) | Open configured category/search and title; retain verified canonical posting URL/ID (`other:<host>:<id>`). | Manual-review discovery only (`max_per_platform: 0` for unverified hosts). Never bypass paywalls or unlock prompts. |
| **Welcome to the Jungle / Otta** (`welcometothejungle`) | Use active brand hostname and owner-approved search; record stable role UUID/link as `welcometothejungle:<id>`. | Otta/WTTJ may redirect across domains; verify final destination via `browser_snapshot`. Route external links via `skills/platforms/ats-engines.md`. |
| **BuiltIn** (`builtin`) | Snapshot title links/location filters; record canonical `/job/.../<id>` as `builtin:<id>`. | Network sites mix Remote, Hybrid, and city-restricted listings — verify work-mode badge in full JD and route external Apply via `skills/platforms/ats-engines.md`. |

### Common loop
1. Snapshot filter labels and current result list. Set confirmed job category, seniority, location and remote options only if available; missing option stays an explicit search limitation.
2. Open one role, capture title/company, location/eligible countries/timezone overlap, contract type, complete description, explicit date and canonical URL. Strip tracking parameters only when they do not change posting identity. No reliable ID → needs_review, not invented identity.
3. Read 10+ seconds and score truthful CV fit. Do not treat “remote” as authorization to work from the owner's country. Missing eligibility is an open question, not Yes.
4. Check posting ID plus canonical employer ATS destination against journal. Keep original discovery ID across redirects; record ATS URL in notes, never create two applications for the same role.
5. Recognized form → ats-engines.md, exact tailored PDF, grounded answers and shared final gate. Unknown/email/paywall/account-creation → manual_apply + needs_review. DailyRemote remains manual until a reviewed adapter/cap is added.
6. Confirm receipt only after permitted single submission; dry run never clicks irreversible Apply. Security prompts/rate limits stop the entire run. Local JSON then optional Notion.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Treating "Remote" as worldwide → ✅ read region and timezone limits.
- ❌ Applying through an aggregator mirror → ✅ follow to the employer's canonical posting.
- ❌ Guessing a missing posting date → ✅ unknown stays unknown.

### Self-verification check (before reporting this step complete)
- [ ] remote region/timezone restrictions captured
- [ ] external apply links resolved to the employer ATS
- [ ] posting date captured or marked unknown

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
