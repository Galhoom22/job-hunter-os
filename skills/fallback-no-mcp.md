---
name: fallback-no-mcp
version: "2.0.0"
description: Load when the owner is running in a web-based AI chat (ChatGPT, Claude Web, Gemini Web) without Playwright MCP or local file tools; produces fact-checked ATS HTML, grounded form answers, and manual upload/logging instructions without claiming browser automation.
triggers:
  - web chat without MCP
  - no Playwright MCP available
  - manual browser fallback
requires_mcp:
  - none
preconditions:
  - owner pasted or attached a job description and verified profile/CV facts in chat
requires_skills:
  - tailor-resume-and-verify
verification:
  - owner was clearly informed that web chat cannot navigate, upload files, or submit applications automatically
  - tailored HTML uses only verified facts from the owner's pasted profile/CV and passes the Anti-AI Slop filter
  - owner received clear manual print-to-PDF and local logging instructions
---
# Non-MCP Web Chat Fallback

## When to Use & Preconditions

Use when the owner interacts through a browser-based AI chat (ChatGPT, Claude.ai, Gemini) that has **no Playwright MCP** and **no local filesystem access**. Never pretend web chat opened a browser, uploaded a PDF, or submitted an application.

- **Load when:** web chat without MCP; no Playwright MCP available; manual browser fallback.
- **Preconditions (stop if any is false):**
  - owner pasted or attached a job description and verified profile/CV facts in chat
- **Requires skills:** `tailor-resume-and-verify`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **State the boundary clearly:** Tell the owner upfront that web chat cannot access `./browser-profile`, fill live forms, or verify submission receipts; you will prepare truthful, ready-to-use artifacts for manual execution.
2. **Request redacted context & full JD:** Ask the owner to paste:
   - The full job description (plus company & URL)
   - Their verified `context/profile.md` / `context/cv.md` (redacting passwords or private tokens) and any required form questions.
3. **Score honestly (`0–10`) & check for red flags:** Evaluate match score and missing skills against verified facts only, and flag any closed/stale posting warnings.
4. **Generate fact-checked, humanized ATS HTML:**
   - Produce clean single-column HTML following `templates/ats-resume-template.html` (and `templates/ats-cover-letter-template.html` only if requested).
   - Enforce the **Fact-Check Guard** (zero invented metrics, dates, companies, or skills) and **Anti-AI Slop filter** (`skills/03-tailor-resume-and-verify.md`).
5. **Guide manual PDF print, form fill & logging:**
   - Instruct the owner to save the HTML locally as `logs/resumes/<company>-<role>/resume.html`, open it in Chrome/Edge, and `Print -> Save as PDF` (A4, margins default/none, headers/footers OFF, verify <= 200 KB and selectable text).
   - Provide grounded plain-text answers for every form question (leaving any unknown legal/salary question explicitly marked for the owner to confirm).
   - Remind the owner to inspect the final confirmation page themselves and record the real status in `logs/applications-log.json` (plus `interview-dossier.md` if preparing for interviews).

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Saying `"I submitted your application"` from a web chat with no MCP tools → ✅ state clearly that the owner reviews, prints, and submits manually.
- ❌ Asking the owner to paste passwords, cookies, or `NOTION_TOKEN` into web chat → ✅ never request credentials.
- ❌ Filling missing salary or visa questions with guesses → ✅ flag unknowns for the owner to decide.

### Self-verification check (before reporting this step complete)
- [ ] owner was clearly informed that web chat cannot navigate, upload files, or submit applications automatically
- [ ] tailored HTML uses only verified facts from the owner's pasted profile/CV and passes the Anti-AI Slop filter
- [ ] owner received clear manual print-to-PDF and local logging instructions
