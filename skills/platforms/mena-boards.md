---
name: mena-boards
version: "1.2.0"
last_verified: "2026-11-18"
description: Load when a target is Wuzzuf, Bayt or LinkedIn for MENA roles and location, language, nationality or authorization rules must be read carefully.
triggers:
  - target.platform in wuzzuf/bayt
  - MENA region search
  - job URL on Wuzzuf or Bayt
requires_mcp:
  - playwright
preconditions:
  - readiness gates passed, auth verified via Playwright MCP, and context loaded
requires_skills:
  - discover-and-triage
verification:
  - nationality/residency/language requirements captured verbatim
  - location matched against confirmed regions
  - authorization answers taken only from verified facts
---
# MENA job boards

## When to Use & Preconditions

Use for MENA boards and region-specific rules.

- **Load when:** target.platform in wuzzuf/bayt; MENA region search.
- **Preconditions (stop if any is false):**
  - readiness gates passed, auth verified via Playwright MCP, and context loaded
- **Requires skills:** `discover-and-triage`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

Enforce all `AGENTS.md` Hard Guardrails (`#1–#10`), `skills/15-multilingual-adaptation.md`, `skills/24-circuit-breaker-and-antiban.md`, and `skills/26-deduplication-and-blacklist-guard.md`. Preserve original Arabic/English question text alongside any translation; never reinterpret a legal, military-service, or salary question to force a match.

### Wuzzuf (`wuzzuf`)
1. Verify named session at configured `auth_check_url`; open search title/location and available career-level/job-type/posted-date filters using confirmed preferences. Never modify Wuzzuf profile completeness as a side effect.
2. Open role, capture verified posting ID and canonical link (`wuzzuf:<id>`), employer, city, onsite/hybrid/remote requirement, education, language, and complete JD.
3. Apply may ask screening questions before or inside the form. Specific skill years require explicit `skills_years` in `context/form-answers.yaml`; military/national service, residency, graduation dates, and citizenship are never inferred.
4. Upload the verified per-job tailored PDF if the form permits; if it forces a shared profile CV replacement, pause for owner review (`needs_review`). Route external redirects via `skills/platforms/ats-engines.md`.

### Bayt (`bayt`)
1. Verify owner account, use Jobs/title/location and visible country/industry/seniority filters. Record `bayt:<verified-posting-id>` and full canonical URL/description.
2. Separate direct employer vacancies from confidential agency leads. Keep salary currency (`EGP`, `AED`, `SAR`, `USD`) and period (`monthly` vs. `annual`) explicit—never convert silently. Visa, nationality, current residence, and relocation are separate owner facts.
3. Apply can reuse the Bayt profile or open a screening questionnaire. Missing answers or mandatory profile changes -> `needs_review`. Any possible one-click submit requires the full Final DOM Read-Back & `APPROVE` gate (`skills/04-fill-and-apply.md`) BEFORE clicking.

### LinkedIn MENA radar
Use linkedin.md with explicitly chosen countries/cities (Egypt, UAE, Saudi Arabia or other owner choices—not automatic regional assumptions). Past 24h and remote/hybrid filters must be verified in snapshot. Arabic/English title variants come from confirmed preferences. Do not infer GCC authorization from Egypt residency or “remote” wording.

### Shared review/submission
Pause to read descriptions, score honest fit and check duplicate posting/ATS URL. Motivation may use 04-fill-and-apply.md in the form's requested language with identical factual meaning. Unknown legal/factual answers: screenshot, open_questions, needs_review, leave tab open, ask in chat. Dry run no Submit; real gate/reservation/receipt as shared skills. CAPTCHA, 2FA, warning or rate limit aborts the entire run; a mid-run login wall pauses per 04-fill-and-apply.md Trap 5 and aborts if unresolved.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Inferring work authorization from the owner's nationality → ✅ ask or block.
- ❌ Ignoring an Arabic-only requirement → ✅ record it and score fit honestly.
- ❌ Treating a profile-completeness prompt as optional → ✅ route to review.

### Self-verification check (before reporting this step complete)
- [ ] nationality/residency/language requirements captured verbatim
- [ ] location matched against confirmed regions
- [ ] authorization answers taken only from verified facts

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
