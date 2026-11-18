---
name: interrogate-and-onboard
version: "1.1.0"
description: Load when any application command arrives (/daily-run, /apply-url, "Start applying", "ابدأ التقديم", "Check my folder") or /setup; it is mandatory Step 0 that blocks on incomplete facts and interviews the owner in batches of 3-4 questions.
triggers:
  - /daily-run (Step 0)
  - /apply-url (Step 0)
  - /setup
  - Check my folder
  - ابدأ التقديم
requires_mcp:
  - playwright
preconditions:
  - agent home resolved (local repo or ~/.job-hunter-os)
  - node bin/job-hunter.mjs doctor can run
requires_skills:
  - resume-ingestion
  - onboarding-chat
verification:
  - doctor prints all five gates with complete:true before any discovery or Submit
  - context/readiness-state.json validates against schemas/readiness.schema.json with missing:[] for every complete gate
  - the owner gave a fresh, explicit launch confirmation for THIS run after seeing the mission briefing
---
# Strict readiness gatekeeper and career interview

## When to Use & Preconditions

Use before every run or single-URL application and whenever readiness may have changed. Never skip it because READY_100% was seen yesterday.

- **Load when:** /daily-run (Step 0); /apply-url (Step 0); /setup; Check my folder; ابدأ التقديم.
- **Preconditions (stop if any is false):**
  - agent home resolved (local repo or ~/.job-hunter-os)
  - node bin/job-hunter.mjs doctor can run
- **Requires skills:** `resume-ingestion`, `onboarding-chat`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

Act as a careful senior technical recruiter: precise, respectful, conversational, never adversarial. Resolve agent home first, including global mode. Read AGENTS.md and the shared readiness contract. This skill is Step 0 BEFORE the existing lock/preflight → auth → context sequence; it never removes/reorders those steps.

### A. Audit and hard block
Run `node bin/job-hunter.mjs doctor` from the agent home and inspect its five-gate audit plus actual context. Missing/invalid/stale `context/readiness-state.json`, any placeholder or any incomplete gate means NO discovery, form filling, tailoring-for-submission or Submit. Show five concise ✅/❌ lines with the missing fields; never dump a long profile or secrets. Enter INTERVIEWING. A JSON label alone is not evidence: the shared bin/readiness.mjs audit rechecks sources/PDF fingerprints and session evidence.

Only synthetic `.example` files are public. Copy readiness-state.json.example if private state is absent, never overwrite existing facts. No example name, salary, authorization, years or consent becomes a real answer. Unknown/deferred mandatory facts keep readiness false; do not pressure users to disclose sensitive details. Notion is optional and not a sixth gate.

### B. Interview in batches of 3–4 questions
Ask only missing/conflicting information, use the owner's language, then WAIT for answers before another batch. Already verified facts do not need repeating. A batch may contain three questions and a fourth only when relevant. After each response: summarize interpretation, resolve ambiguity, write supplied facts with local IDE tools, preserve unrelated formatting/values, update affected gates/state and rerun the audit. No silent promotion to owner_confirmed or overall_ready.

1. **Resume and identity:** read supplied CV/PDF locally with skills/01-resume-ingestion.md (`parse-cv` for binaries), verify owner identity/contact, dates/projects and skills. Ask missing GitHub/portfolio or project outcomes when useful; absent optional links/metrics are not blockers and must never be invented. If metrics unknown, keep truthful qualitative bullets. PDF must be real, inspected for readable content and zero placeholders; a `%PDF-` signature alone is insufficient. Prefer assets/resume.pdf; context/resume.pdf is also allowed. Record selected path in form answers. Extract faithful context/cv.md and verified profile.md using skills/00-onboarding-chat.md.
2. **Target strategy:** ask target roles + seniority; Remote/Hybrid/Onsite choices; regions + timezones/overlap; company blacklist/dealbreakers. An explicitly confirmed empty blacklist is valid, not missing. Write preferences and state requirements. Empty/unconfirmed target roles are not valid.
3. **Compensation and legal:** minimum amount + currency + hourly/monthly/annual period; notice period + earliest start YYYY-MM-DD; work authorization per target country; visa sponsorship requirements. Never infer from nationality/location. If owner cannot answer, remain blocked. Store exact legal facts and mappings in form-answers/profile; salary answers must preserve units/currency.
4. **Technology matrix:** show core skills already observed in CV, ask exact hands-on years for 3–4 skills per batch, accept explicitly confirmed 0 and fractional years. Do not compute years from generic tenure, conflate professional vs personal use or copy JD technologies. Write skills_years and core_skills; any core skill lacking a confirmed number blocks its gate.
5. **Platforms and sessions:** selected platforms, permitted automation, approved searches and result limits; verify actual headed MCP login/access using skills/00-onboarding-chat.md. Setup browser actions are permitted solely to complete login, not to run applications. User enters passwords/challenges privately; agent never solves them. For public boards auth_required:false, record verified public access, not fictional login. Set sessions platform/verified_at/evidence/authenticated from a real snapshot/account indicator, no cookies. Evidence expires after 24 hours and must be rechecked during every run.

### C. State updates and evidence
Use schemas/readiness.schema.json. Each gate complete:true needs explicit owner confirmation of its mandatory fields, verified_at ISO timestamp, missing:[] and observed source evidence. Keep owner confirmation separate from parsed CV facts. Requirements mirror the confirmed facts in preferences/profile/form answers; conflicting sources always block. Set updated_at with current UTC time. Compute SHA-256 source_hashes using bin/readiness.mjs sourceHash for profile.md, cv.md, preferences.yaml, form-answers.yaml, targets.yaml and the selected PDF AFTER all writes; never hash secrets/browser storage. Changes invalidate affected gates until reverified. Do not edit hashes merely to suppress an audit failure.

When all five audited gates pass, set overall_ready:true and status:"READY_100%", validate the JSON contract and rerun doctor. READY_100% describes these five prerequisites, not a guarantee of application success, permanent login or safety immunity. Keep all usual caps, dry run, uncertain reservations and stop rules. Required helper dependencies missing remain a preflight blocker, not a reason to bypass validation.

### D. Mission briefing and explicit per-run consent
After the five gates pass, before any run browser action show a concise briefing: confirmed roles/regions/work modes, selected platforms, EFFECTIVE daily/platform caps including first-three-run-date warm-up, minimum score, and DRY RUN vs LIVE. Ask “Confirm to launch?” (in the owner's language). Wait for an explicit affirmative response to THIS exact briefing; initial /daily-run, old consent or READY_100% alone does not count. Any changed targets/cap/mode/profile requires a fresh briefing/confirmation. Consent is one run only; no automatically persisted blanket launch approval.

After confirmation, acquire owned lock, run preflight (exit 0 required), verify current auth, load context and follow daily-run.md or apply-url.md. Do not falsely say a run started while waiting in chat. If the turn ends before the owner answers, nothing continues in the background.

### E. Live new questions
Follow fill-form-answers.md: pause this tab, record needs_review/open_questions and ask exact question/options/units. With owner answer, store an exact, context-scoped Q&A locally, update fingerprints/affected evidence only after confirmation, rerun readiness/current safety checks and re-snapshot before resuming. Legal/consent/company-specific answers must not become broad reusable keyword guesses. No answer → remain review. CAPTCHA/2FA/login/security warnings abort the entire run regardless of interview progress.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Marking a gate complete because a CV mentions it → ✅ only explicit owner confirmation with verified_at completes a gate.
- ❌ Asking ten questions at once → ✅ ask 3–4, wait, save, re-audit, then continue.
- ❌ Copying example salary/authorization values from .example files → ✅ examples are never facts; unknown stays unknown and blocks.
- ❌ Treating READY_100% as permission to submit → ✅ it only allows the briefing; submits still need approval-gate.md.

### Self-verification check (before reporting this step complete)
- [ ] doctor prints all five gates with complete:true before any discovery or Submit
- [ ] context/readiness-state.json validates against schemas/readiness.schema.json with missing:[] for every complete gate
- [ ] the owner gave a fresh, explicit launch confirmation for THIS run after seeing the mission briefing

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
