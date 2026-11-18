---
name: apply-external-ats
version: "3.1.0"
description: Load when an eligible job's Apply button redirects or opens a new tab to an employer ATS (Greenhouse, Lever, Ashby, SmartRecruiters, BreezyHR, Workday, Taleo or unknown).
triggers:
  - Apply on company site
  - new tab after Apply
  - apply_type == external_ats
requires_mcp:
  - playwright
preconditions:
  - run lock owned, preflight exit 0, auth verified, context loaded (daily-run steps 1-3)
  - eligible score and duplicate check by job_id AND canonical ATS URL
  - per-job tailored file exists
requires_skills:
  - fill-form-answers
  - approval-gate
  - log-application
  - meta-self-verification
verification:
  - final HTTPS hostname recorded in notes and matched to a known ATS or routed to review
  - employer and role on the ATS page match the original posting
  - after Submit a fresh snapshot shows a job-identifiable receipt, quoted in notes; otherwise needs_review
  - agent-opened tabs closed and the original board tab is active again
---
# External ATS Dispatcher

## When to Use & Preconditions

Use for redirects and new tabs. In-page modals use apply-easy-apply; Workday/Taleo end as manual_apply + needs_review.

- **Load when:** Apply on company site; new tab after Apply; apply_type == external_ats.
- **Preconditions (stop if any is false):**
  - run lock owned, preflight exit 0, auth verified, context loaded (daily-run steps 1-3)
  - eligible score and duplicate check by job_id AND canonical ATS URL
  - per-job tailored file exists
- **Requires skills:** `fill-form-answers`, `approval-gate`, `log-application`, `meta-self-verification`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

New tab / redirect flow ("Apply on company site" → Greenhouse, Lever, Ashby, Workable, SmartRecruiters…):
1. Note the current tab list (`browser_tabs` list), click Apply, wait, then list tabs again. If a new tab appeared, select it (`browser_tabs` select); if the same tab navigated, stay. Snapshot and record the final HTTPS destination URL in notes.
2. Confirm the employer and role match the posting. Unknown host or mismatch → needs_review.
3. If the page is an ATS landing/description page, click "Apply for this job" / "Apply now" / "I'm interested" to reach the form; snapshot again.
4. Upload this job's tailored file FIRST (PDF, or `.docx` when only Word is accepted; fill-form-answers.md Traps 1–3 with absolute paths), wait 4 s for auto-parse, fresh snapshot, then fill and correct remaining fields (Trap 4).
5. Submission follows step 5 below. When finished or paused, close only tabs the agent opened and return to the original board tab.

1. Snapshot and pace before Apply. If a tab opens, list/switch tabs and inspect final HTTPS hostname. Preserve original job_id, record final canonical ATS URL in notes and check duplicates by that URL too.
2. Route only recognized employer hosts to skills/ats/: Greenhouse (boards.greenhouse.io or job-boards.greenhouse.io), Lever (jobs.lever.co), Ashby (jobs.ashbyhq.com), SmartRecruiters (jobs.smartrecruiters.com), BreezyHR (company.breezy.hr).
3. Workday (myworkdayjobs.com/myworkdaysite.com), Taleo (taleo.net), other complex portals or account creation -> apply_type:manual_apply, status:needs_review. Unknown hosts or employer mismatch also review. Never create accounts or grant OAuth automatically.
4. Snapshot form and follow ATS playbook; use verified resume_pdf_path through fill-form-answers.md. Optional cover letter empty unless owner permits; text box <=120 words grounded only in CV; a REQUIRED cover-letter file upload uses the approved cover-letter.pdf from tailor-resume.md section 4. Required unknown question -> review with screenshot/open_questions.
5. Run skills/approval-gate.md before any irreversible click. Final safety gate, dry-run behavior, journal reservation and receipt verification are exactly apply-easy-apply.md steps 3–6. Never retry ambiguous submission. CAPTCHA, 2FA challenge, account warning or rate limit aborts the entire run immediately; a sign-in wall follows fill-form-answers.md Trap 5. Never create accounts.

After the Submit click run skills/meta-self-verification.md; form rejections go to skills/meta-structured-debugging.md; stale refs after tab switches go to skills/meta-dom-recovery.md. Ensure `logs/resumes/<folder>/interview-dossier.md` is saved via `skills/interview-dossier.md`, and if a posting requires applying by email instead of an ATS form, route to `skills/direct-email-drafter.md`.


## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Guessing the ATS from the board link → ✅ inspect the final hostname after the redirect.
- ❌ Creating an account or granting OAuth to continue → ✅ manual_apply + needs_review.
- ❌ Losing the original job_id after the redirect → ✅ keep it and store the ATS URL in notes for duplicate checks.

### Self-verification check (before reporting this step complete)
- [ ] final HTTPS hostname recorded in notes and matched to a known ATS or routed to review
- [ ] employer and role on the ATS page match the original posting
- [ ] after Submit a fresh snapshot shows a job-identifiable receipt, quoted in notes; otherwise needs_review
- [ ] agent-opened tabs closed and the original board tab is active again

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
