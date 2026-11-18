# External ATS Dispatcher — v2

1. Snapshot and pace before Apply. If a tab opens, list/switch tabs and inspect final HTTPS hostname. Preserve original job_id, record final canonical ATS URL in notes and check duplicates by that URL too.
2. Route only recognized employer hosts to skills/ats/: Greenhouse (boards.greenhouse.io or job-boards.greenhouse.io), Lever (jobs.lever.co), Ashby (jobs.ashbyhq.com), SmartRecruiters (jobs.smartrecruiters.com), BreezyHR (company.breezy.hr).
3. Workday (myworkdayjobs.com/myworkdaysite.com), Taleo (taleo.net), other complex portals or account creation -> apply_type:manual_apply, status:needs_review. Unknown hosts or employer mismatch also review. Never create accounts or grant OAuth automatically.
4. Snapshot form and follow ATS playbook; use verified resume_pdf_path through fill-form-answers.md. Optional cover letter empty unless owner permits; if permitted <=120 words, grounded only in CV. Required unknown question -> review with screenshot/open_questions.
5. Run skills/approval-gate.md before any irreversible click. Final safety gate, dry-run behavior, journal reservation and receipt verification are exactly apply-easy-apply.md steps 3–6. Never retry ambiguous submission. CAPTCHA, 2FA, unexpected login or rate limit aborts the entire run immediately.
