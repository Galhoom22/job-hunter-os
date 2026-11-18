# Fill Form Answers & Resume — v2

Input: fresh snapshot field label/type/options. Only owner_verified:true facts may be used.

1. For specific years with skill X, FIRST use skills_years[X]; absent -> UNKNOWN. Never let generic "how many years" overwrite a skill-specific answer.
2. For other questions exact/unambiguous keyword match in questions[].match, then explicit profile fact. Conflicting matches, missing required facts or no matching option -> UNKNOWN, never guess numbers/salary/legal status.
3. For a resume `<input type="file">`, use resume_pdf_path (default template ./assets/resume.pdf), verified by preflight as an existing PDF. Snapshot and identify the labeled Upload resume/CV control; click it to open the chooser then call Playwright MCP browser_file_upload with the absolute local path. If existing resume selection is offered, verify EXACT filename matches that file and owner confirms version. Never use arbitrary cached resume.
4. If input is hidden, use its accessible upload button to open the chooser; do not inject scripts or use guessed CSS selectors. If inaccessible, needs_review. Snapshot afterward and verify displayed filename/upload success. Failed or ambiguous upload -> needs_review, no Submit.
5. Each click/type/select/upload gets random 3–9s pacing; snapshot after every step. Required consents and EEO use explicit owner answers; no prechecked newsletter/company follow unless owner permits.
6. UNKNOWN: record question, field_type, options in open_questions; screenshot locally (redact sensitive data), leave tab open, needs_review and move on. CAPTCHA/2FA stops whole run, not merely this job.

When tailoring is on, upload the specific verified logs/resumes PDF produced by tailor-resume.md and recorded in this job notes; do NOT replace it with the base resume or edit global form answers.

Motivation-only questions use skills/grounded-answer.md for 2–3 grounded sentences. Missing factual/legal parts always remain UNKNOWN; leave the tab open, log review and ask the owner in chat.
