---
name: offer-negotiator
version: "1.0.0"
description: Load when the owner receives a recruiter compensation question, B2B hourly/monthly rate check, or formal job offer; benchmarks terms against context/preferences.yaml and context/form-answers.yaml and drafts calm, humanized negotiation replies without auto-sending.
triggers:
  - recruiter asked my rate / salary expectation
  - received job offer
  - negotiate offer or compensation
requires_mcp:
  - none
preconditions:
  - recruiter message, rate prompt, or offer details supplied by the owner
  - verified compensation floor and work terms read from context/preferences.yaml or context/form-answers.yaml
requires_skills:
  - tailor-resume-and-verify
  - outreach-and-interview-prep
verification:
  - comparison table explicitly checks base pay, currency, period (hourly/monthly/annual), notice, and remote/visa terms against the owner's verified floor
  - drafted reply uses only verified experience/facts, contains 0 AI-slop clichés, and is marked DRAFT_ONLY
  - nothing was sent automatically without explicit owner approval
---
# Salary, B2B Rate & Offer Negotiator

## When to Use & Preconditions

Use whenever a recruiter asks for salary/rate expectations mid-process or sends a written/verbal offer. Helps the owner protect their floor and negotiate total compensation calmly—strictly draft-only.

- **Load when:** `recruiter asked my rate / salary expectation`; `received job offer`; `negotiate offer or compensation`.
- **Preconditions (stop if any is false):**
  - recruiter message, rate prompt, or offer details supplied by the owner
  - verified compensation floor and work terms read from `context/preferences.yaml` or `context/form-answers.yaml`
- **Requires skills:** `tailor-resume-and-verify`, `outreach-and-interview-prep`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **Audit the offer / inquiry against verified owner terms:**
   - Extract from the recruiter's message: base salary or B2B rate, currency, gross vs net, payment cadence (`hourly` / `monthly` / `annual`), equity/bonus, PTO, contract type (full-time vs contractor), location/timezone, and visa support.
   - Compare side-by-side in chat against the owner's verified minimum in `context/preferences.yaml` / `context/form-answers.yaml` / active persona (`skills/07-persona-switcher.md`). Flag any missing terms (e.g., undisclosed currency, gross vs net, unpaid trial, or missing sponsorship).
2. **Never invent competing offers or fake metrics:**
   - If anchoring a counter-offer or target range, base the rationale strictly on:
     - Verified years of experience and relevant shipped systems from `context/profile.md`
     - Role scope and market terms provided by the owner (never fabricate `"I have another offer for $X"` unless the owner explicitly provides that verified fact).
3. **Draft 2–3 concise, humanized reply options (`DRAFT_ONLY`):**
   - **Option A — Anchor / Counter:** Calm, collaborative counter-proposal citing role scope + verified relevant work.
   - **Option B — Clarify Terms First:** Defer exact numbers until scope, level, benefits, or contract structure are clarified.
   - **Option C — Accept / Proceed:** Clear written confirmation of agreed numbers and start date (`earliest_start_date` / `notice_period`).
   - Run every draft through the Anti-AI Slop filter (`skills/03-tailor-resume-and-verify.md`: zero clichés, zero em-dashes, concise plain tone).
4. **Save & wait for owner decision:**
   - Save the comparison and selected draft to `logs/resumes/<company>-<role>-<job-id>/negotiation-notes.md` (if a job folder exists) marked `DRAFT_ONLY`.
   - Never send any email or LinkedIn reply automatically; wait for the owner to edit, approve, or send manually.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Inventing a competing offer or inflating current salary to gain leverage → ✅ use only verified facts and role-scope rationale.
- ❌ Accepting or rejecting an offer on the owner's behalf → ✅ always present comparison + `DRAFT_ONLY` options and wait.
- ❌ Comparing monthly net vs annual gross without normalizing currency and period → ✅ always state exact currency, gross/net, and period.

### Self-verification check (before reporting this step complete)
- [ ] comparison table explicitly checks base pay, currency, period (hourly/monthly/annual), notice, and remote/visa terms against the owner's verified floor
- [ ] drafted reply uses only verified experience/facts, contains 0 AI-slop clichés, and is marked `DRAFT_ONLY`
- [ ] nothing was sent automatically without explicit owner approval
