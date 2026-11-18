# Greenhouse ATS playbook

1. Confirm final HTTPS hostname is boards.greenhouse.io / job-boards.greenhouse.io, matching the employer and the posting; lookalike/mismatched domains go to review. Use owner-approved board URLs, never submit to these template homepages.
2. Open the employer job board, snapshot department headings and job links. Use gh_jid or the job URL ID. On the job page open Apply for this job and snapshot the application form; hidden anti-bot fields are never touched.
3. Capture employer, role, location, full requirements and stable greenhouse:id. For redirects retain original discovery job_id; store ATS URL in notes to avoid duplicate submissions across boards.
4. Snapshot form before each interaction; use labels/roles/refs with random 3–9 second pacing. Upload through fill-form-answers.md. Verify resume filename and only owner-approved contact/legal answers.
5. Unknown required field, account requirement, CAPTCHA, 2FA or inaccessible upload is NOT a reason to invent answers or inject DOM code. Unknown field -> review; CAPTCHA/2FA -> abort entire run.
6. Next/Continue can be irreversible: inspect accessible text. Before any submitting action reserve journal, validate and re-read caps/deduplication. dry_run stops before submit. Verify confirmation URL/text and receipt before updating applied; uncertain -> needs_review.
7. Use log-application.md for local-first write and Notion upsert. Never retry a timed-out submission automatically.
