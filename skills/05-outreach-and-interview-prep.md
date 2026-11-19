---
name: outreach-and-interview-prep
version: "2.0.0"
description: Load when a Tier A application is prepared or submitted, a posting asks for direct email application, or the owner invokes /linkedin-growth; creates interview-dossier.md, <=75-word draft-only outreach-draft.md, or email-draft.md without auto-sending.
triggers:
  - Tier A application prepared or submitted
  - posting asks to apply via email (careers@...)
  - /linkedin-growth
requires_mcp:
  - playwright
preconditions:
  - full job description and verified context/profile.md available
  - explicit owner approve before any live LinkedIn Save, Post, or Send
requires_skills:
  - tailor-resume-and-verify
  - meta-self-verification
verification:
  - interview-dossier.md saved in logs/resumes/<folder>/ with full archived JD, tailored emphasis, and top 5 prep questions
  - outreach-draft.md (for Score >= 8) is strictly <= 75 words, humanized, and marked DRAFT_ONLY
  - email-draft.md (for email-apply jobs) includes exact To, Subject, Attachment path, and plain-text Body, with zero emails or DMs auto-sent
---
# Hiring Manager 75-Word Outreach, Direct Email Draft & Interview Dossier

## When to Use & Preconditions

Turns each high-match application into an interview-ready package while keeping all outreach strictly draft-only until the owner explicitly asks to send.

- **Load when:** Tier A application prepared or submitted; posting asks to apply via email (`careers@...`); `/linkedin-growth`.
- **Preconditions (stop if any is false):**
  - full job description and verified `context/profile.md` available
  - explicit owner `approve` before any live LinkedIn Save, Post, or Send
- **Requires skills:** `tailor-resume-and-verify`, `meta-self-verification`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

### 1. Post-Application Interview Prep & Archived JD Dossier (`interview-dossier.md`)
Whenever an application is prepared or submitted, save `logs/resumes/<company>-<role>-<job-id>/interview-dossier.md` containing:
1. **Application Snapshot:** Company, Role, `job_id`, canonical URL, ATS hostname, status, timestamp, match score, and `resume.pdf` path.
2. **Archived Full Job Description:** Verbatim copy of the complete expanded JD so the owner still has it if the employer deletes the posting before calling.
3. **Tailored CV Emphasis & Evidence:** Which verified projects, employers, and skills were moved up or highlighted in `resume.pdf` (matching `tailoring-notes.md`), plus identified skill gaps.
4. **Top 5 Likely Technical & Behavioral Interview Questions:** 5 targeted questions derived directly from the gaps and core requirements between `context/profile.md` and the archived JD, paired with honest talking-point cues grounded in verified projects.

### 2. Hiring Manager Radar & 75-Word Outreach Drafter (`outreach-draft.md`)
For any high-match job (**Score >= 8**):
1. Check the posting for `"Meet the hiring team"` or, if LinkedIn is authorized, inspect the company's `People` tab (paced 3–9 s, read-only) for likely **Engineering Manager**, **Tech Lead**, or **Technical Recruiter** contacts. Record only observed names/titles/URLs; never guess names.
2. Draft a personalized connection note or cold message strictly capped at **<= 75 words** (count every whitespace-separated word before saving!).
3. Run the draft through the Fact-Check Guard (verified skills/projects only) and Anti-AI Slop filter (`skills/03-tailor-resume-and-verify.md`: zero clichés, zero em-dashes).
4. Save to `logs/resumes/<company>-<role>-<job-id>/outreach-draft.md` labeled `DRAFT_ONLY`. **Never send messages or connection invites automatically.**

### 3. Direct Email Application Drafter (`email-draft.md`)
When a posting (Wuzzuf, LinkedIn Post, Hacker News Who's Hiring, RemoteOK) instructs candidates to email `careers@company.com` (often with a required subject code) instead of an ATS form:
1. Extract the exact `To:` address and verbatim required `Subject:` code from the JD (never guess `careers@` if absent).
2. Tailor and verify `logs/resumes/<company>-<role>-<job-id>/resume.pdf` via `skills/03-tailor-resume-and-verify.md`.
3. Write `logs/resumes/<company>-<role>-<job-id>/email-draft.md` with:
   - `To:` exact address
   - `Subject:` exact required subject line
   - `Attachment:` exact absolute OS path to `resume.pdf`
   - `Body:` concise, humanized plain-text pitch (<= 150 words) using only verified facts
   - Status: `DRAFT_ONLY — send manually from your mail client`
4. Log the job as `apply_type: "manual_apply"`, `status: "needs_review"`, and show the draft in chat.

### 4. `/linkedin-growth` (Recruiter-SEO Profile Optimizer, Posts & Explicit-Send Outreach)
- Only when explicitly requested outside a daily application run.
- For full **0–100 Recruiter-SEO Profile Audits** and grounded section-by-section rewrites (`Headline`, `About`, `Experience Bullets`, `Featured & Skills`), load `skills/linkedin-growth.md`.
- Show side-by-side proposed profile edits, post drafts, or exact recipient + `<= 75`-word outreach text in chat (`DRAFT_ONLY`), run `node ./bin/cli.mjs pre-submit` on outreach drafts, wait for exact `APPROVE`, then stage/save and read back via `skills/meta-self-verification.md`.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Auto-sending cold emails, DMs, or LinkedIn connection requests during a daily run → ✅ strictly draft-only files unless the owner explicitly commands and approves sending.
- ❌ Writing a 110-word connection note full of `"thrilled to connect — delve"` → ✅ hard cap <= 75 words, plain peer tone.
- ❌ Summarizing the JD in 2 sentences inside `interview-dossier.md` → ✅ archive the complete verbatim JD.

### Self-verification check (before reporting this step complete)
- [ ] `interview-dossier.md` saved in `logs/resumes/<folder>/` with full archived JD, tailored emphasis, and top 5 prep questions
- [ ] `outreach-draft.md` (for `Score >= 8`) is strictly `<= 75` words, humanized, and marked `DRAFT_ONLY`
- [ ] `email-draft.md` (for email-apply jobs) includes exact `To`, `Subject`, `Attachment` path, and plain-text `Body`, with zero emails or DMs auto-sent
