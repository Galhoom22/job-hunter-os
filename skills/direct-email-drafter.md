---
name: direct-email-drafter
version: "1.0.0"
description: Load when a job posting asks candidates to apply by emailing an address (e.g., careers@company.com with a subject code) instead of an ATS form; generates email-draft.md with recipient, subject, plain-text body, and PDF path without auto-sending.
triggers:
  - posting asks to send CV via email
  - HackerNews Who's Hiring / Wuzzuf / LinkedIn post email apply
  - apply_type == manual_apply with email instruction
requires_mcp:
  - none
preconditions:
  - full job description captured with an explicit destination email address
  - per-job tailored resume.pdf rendered and verified under logs/resumes/<folder>/
requires_skills:
  - tailor-resume
  - fact-check-guard
  - humanize-writing
  - log-application
verification:
  - email-draft.md exists in the job's logs/resumes/<folder>/ directory with To, Subject, Attachment (absolute path), and Body
  - To email and Subject code match the observed job posting verbatim
  - no email was sent automatically and the job is logged as needs_review (manual_apply)
---
# Direct Email Application Drafter

## When to Use & Preconditions

Use when startups or regional postings instruct applicants to email `careers@...` / `jobs@...` (common on Wuzzuf, LinkedIn Posts, and Hacker News Who's Hiring) rather than using a web ATS form.

- **Load when:** posting asks to send CV via email; HackerNews Who's Hiring / Wuzzuf / LinkedIn post email apply; `apply_type == manual_apply` with email instruction.
- **Preconditions (stop if any is false):**
  - full job description captured with an explicit destination email address
  - per-job tailored `resume.pdf` rendered and verified under `logs/resumes/<folder>/`
- **Requires skills:** `tailor-resume`, `fact-check-guard`, `humanize-writing`, `log-application`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **Extract exact email instructions from the JD:**
   - Capture the verbatim destination email address (`To:`) and any required subject line / reference code (e.g., `"[BE-2026] Senior Backend Engineer"`).
   - If no email address appears in the posting, never guess `careers@` or `jobs@`; ask the owner instead.
   - If the posting specifies no subject format, use `<Role Title> — <Owner Full Name>`.
2. **Prepare and verify the tailored PDF attachment:**
   - Run `skills/tailor-resume.md` and `skills/fact-check-guard.md` (`verify-cv` + `render-cv`) so `logs/resumes/<folder>/resume.pdf` exists and is readable (< 200 KB).
   - Resolve the exact **absolute OS path** to `resume.pdf`.
3. **Draft the plain-text email body:**
   - Write 3–5 concise sentences (under 150 words) in plain text:
     - Role being applied for and where the posting was seen.
     - 2 concrete verified skills/projects matching the JD's core needs.
     - Notice period / location / work authorization only if explicitly verified in `context/profile.md` or `context/form-answers.yaml`.
     - Clear sign-off with owner's verified contact info.
   - Pass through `skills/humanize-writing.md` (zero AI slop, zero em-dashes) and `skills/fact-check-guard.md`.
4. **Write `email-draft.md` in the job's folder:**
   - Save `logs/resumes/<company>-<role>-<job-id>/email-draft.md` with exact sections:
     - `To:`
     - `Subject:`
     - `Attachment:` (exact absolute path to `resume.pdf`)
     - `Body:` (plain-text block ready to copy-paste)
     - `Action:` `DRAFT_ONLY — send manually from your email client`
5. **Log & present in chat:**
   - Log the job with `apply_type: "manual_apply"`, `status: "needs_review"`, and the `email-draft.md` path in `notes` via `npm run journal` + `npm run validate:logs`.
   - Show `To`, `Subject`, `Body`, and `Attachment` path in chat so the owner can send it with one review.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Auto-sending emails via SMTP/CLI or browser mailto scripts → ✅ strictly draft-only in `email-draft.md`.
- ❌ Guessing `hr@company.com` when the post didn't list an address → ✅ only use an explicitly observed address.
- ❌ Dropping the posting's required `[REF-CODE]` in the Subject line → ✅ copy required subject rules verbatim.

### Self-verification check (before reporting this step complete)
- [ ] `email-draft.md` exists in the job's `logs/resumes/<folder>/` directory with `To`, `Subject`, `Attachment` (absolute path), and `Body`
- [ ] `To` email and `Subject` code match the observed job posting verbatim
- [ ] no email was sent automatically and the job is logged as `needs_review` (`manual_apply`)

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
