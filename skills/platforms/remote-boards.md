---
name: remote-boards
version: "1.1.0"
description: Load when a target is WeWorkRemotely, RemoteOK, DailyRemote, Welcome to the Jungle/Otta or BuiltIn and remote eligibility (regions, timezones) must be verified.
triggers:
  - target.platform in weworkremotely/remoteok/welcometothejungle/builtin
  - remote-only search
requires_mcp:
  - playwright
preconditions:
  - run lock owned, preflight exit 0, auth verified, context loaded (daily-run steps 1-3)
requires_skills:
  - discover-jobs
  - score-job
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
  - run lock owned, preflight exit 0, auth verified, context loaded (daily-run steps 1-3)
- **Requires skills:** `discover-jobs`, `score-job`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

Live-unverified. Use fresh accessibility snapshots/refs with 3–9s waits, read full JDs and enforce shared preflight/auth/context/safety. Public browsing is allowed only when target.auth_required:false; an unexpected login wall pauses per fill-form-answers.md Trap 5 and aborts if unresolved. No subscriptions, account creation or newsletter consent as side effects.

| Board | Discovery and canonical identity | Apply routing / distinctive checks |
|---|---|---|
| WeWorkRemotely | Read configured category, open title/company link and retain canonical `/remote-jobs/<slug>`; `weworkremotely:<slug>` | Read region/timezone tags in description; Apply often exits board or opens email. Employer ATS uses dispatcher; email application requires owner review, never automatic send. See weworkremotely.md. |
| RemoteOK | Snapshot role rows, open details, verify numeric posting ID from canonical role link; `remoteok:<id>` | Salary badges may be estimates: preserve attribution. Read country restrictions; distinguish Apply from subscription. ATS redirect inspected before action. See remoteok.md. |
| DailyRemote | Open configured category/search and title; retain verified canonical posting URL/ID in notes; use `other:<host>:<id>` only when ID reliable | Documentation/manual-only (other cap 0). Do not bypass paywalls or unlock prompts. Search filters and remote-country terms from snapshot, review external destination, no automated submit. |
| Welcome to the Jungle / Otta | Use actual active brand hostname and owner-approved search; record stable role UUID/link, `welcometothejungle:<id>` | Otta may redirect/rebrand: verify destination rather than asserting old URLs work. Matching/profile onboarding never authorizes profile changes. ATS dispatcher for external role; gated/unsupported flow review. |
| BuiltIn | Snapshot title links/location filters; record canonical `/job/.../<id>` and `builtin:<id>` when verified | Network sites can mix remote/hybrid or city constraints. Read employer posting; distinguish external Apply and saved-job/account actions. See builtin.md. |

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
