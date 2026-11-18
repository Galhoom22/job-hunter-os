# External ATS Dispatcher — v3

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
