---
name: hiring-manager-outreach
version: "1.0.0"
description: Load when a job scores >= 8 (Tier A) or the owner requests hiring-manager outreach; identifies likely Engineering Manager, Tech Lead, or Technical Recruiter contacts and saves a <=75-word draft to outreach-draft.md without sending.
triggers:
  - high-match job (Score >= 8)
  - find hiring manager for job
  - draft outreach for application
requires_mcp:
  - playwright
preconditions:
  - job scored >= 8 (or explicit owner request) with full JD and company name
  - authorized browser session if inspecting LinkedIn People / Meet the hiring team
requires_skills:
  - humanize-writing
  - fact-check-guard
  - linkedin-outreach
verification:
  - outreach-draft.md saved inside the job's logs/resumes/<folder>/ directory
  - countWords(draft_message) <= 75 and zero AI-slop phrases
  - zero messages or connection invites were sent without explicit owner approval
---
# Hiring Manager Radar & 75-Word Outreach Drafter

## When to Use & Preconditions

Draft high-signal outreach for top-match roles (`Score >= 8`) so the owner can follow up after applying. **Strictly draft-only** — never send a connection invite or message automatically.

- **Load when:** high-match job (Score >= 8); find hiring manager for job; draft outreach for application.
- **Preconditions (stop if any is false):**
  - job scored >= 8 (or explicit owner request) with full JD and company name
  - authorized browser session if inspecting LinkedIn People / Meet the hiring team
- **Requires skills:** `humanize-writing`, `fact-check-guard`, `linkedin-outreach`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

1. **Identify likely decision-makers (read-only, paced 3–9 s):**
   - First check the job posting itself for a `"Meet the hiring team"` card or named recruiter/hiring manager.
   - If none is shown and LinkedIn is authorized, open the company's LinkedIn `People` tab (or search `"<Company>" ("Engineering Manager" OR "Tech Lead" OR "Head of Engineering" OR "Technical Recruiter")`) with normal pacing.
   - Record up to 2–3 plausible contacts `{ name, title, profile_url, source_observed }` in the draft file. If no specific person is observable without hitting a search limit or login wall, target `"Hiring Manager / Engineering Lead at <Company>"` and note that no named profile was resolved.
2. **Draft the <= 75-word outreach message:**
   - Structure (3 short sentences, plain peer tone):
     1. Context: exact role applied to (or applying for) at `<Company>`.
     2. Evidence: 1–2 concrete verified skills/projects matching the JD's top technical need.
     3. Low-friction close: concise offer to share context or chat.
   - Apply `skills/humanize-writing.md` (zero AI slop, zero em-dashes) and `skills/fact-check-guard.md` (only verified CV facts).
   - Count words strictly (`countWords(message) <= 75` per `bin/agent-rules.mjs`). Trim until `<= 75`.
3. **Save to the job's folder:**
   - Write `logs/resumes/<company>-<role>-<job-id>/outreach-draft.md` (inside the same per-job folder under `logs/resumes/`) containing:
     - Target company, role, `job_id`, canonical URL
     - Observed contacts (`name`, `title`, `profile_url`)
     - Exact message text and word count (`N / 75 words`)
     - Status: `DRAFT_ONLY — requires explicit owner review and approve before sending`
4. **Never auto-send:**
   - Present the draft summary in chat. Sending any message later requires explicit owner `approve` in chat via `skills/linkedin-outreach.md`.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Sending connection requests or InMails automatically during a daily run → ✅ strictly draft-only in `outreach-draft.md`.
- ❌ Exceeding 75 words or writing `"I'm thrilled to delve into..."` → ✅ hard cap <= 75 words and run `skills/humanize-writing.md`.
- ❌ Guessing a person's name or claiming a referral → ✅ record only contacts actually observed in snapshots.

### Self-verification check (before reporting this step complete)
- [ ] `outreach-draft.md` saved inside the job's `logs/resumes/<folder>/` directory
- [ ] `countWords(draft_message) <= 75` and zero AI-slop phrases
- [ ] zero messages or connection invites were sent without explicit owner approval

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
