# Fill Form Answers & Resume — v2

Input: fresh snapshot field label/type/options. Only owner_verified:true facts may be used.

1. For specific years with skill X, FIRST use skills_years[X]; absent -> UNKNOWN. Never let generic "how many years" overwrite a skill-specific answer.
2. For other questions exact/unambiguous keyword match in questions[].match, then explicit profile fact. Conflicting matches, missing required facts or no matching option -> UNKNOWN, never guess numbers/salary/legal status.
3. For a resume `<input type="file">`, use resume_pdf_path (default template ./assets/resume.pdf), verified by preflight as an existing PDF. Snapshot and identify the labeled Upload resume/CV control; click it to open the chooser then call Playwright MCP browser_file_upload with the absolute local path. If existing resume selection is offered, verify EXACT filename matches that file and owner confirms version. Never use arbitrary cached resume.
4. If input is hidden, use its accessible upload button to open the chooser; do not inject scripts or use guessed CSS selectors. If inaccessible, needs_review. Snapshot afterward and verify displayed filename/upload success. Failed or ambiguous upload -> needs_review, no Submit.
5. Each click/type/select/upload gets random 3–9s pacing; snapshot after every step. Required consents and EEO use explicit owner answers; no prechecked newsletter/company follow unless owner permits.
6. UNKNOWN: record exact question, field_type/options/units in open_questions; screenshot locally without secrets, leave tab open, needs_review and PAUSE this application. Ask the exact question in chat and wait. No answer means no continuation. CAPTCHA/2FA stops the whole run, not merely this job.

When tailoring is on, upload the specific verified logs/resumes PDF produced by tailor-resume.md and recorded in this job notes; do NOT replace it with the base resume or edit global form answers.

Motivation-only questions use skills/grounded-answer.md for 2–3 grounded sentences. Missing factual/legal parts always remain UNKNOWN; leave the tab open, log review and ask the owner in chat.


## Continuous owner-verified answer learning
When the owner replies, clarify ambiguity/units/legal scope and confirm the interpretation. Append the exact verified Q&A to private context/form-answers.yaml questions[] without overwriting other mappings. Use exact wording and record company/role/country/date/option context in a YAML comment; do not add broad keyword synonyms. An employer-specific motivation, consent, salary or sponsorship answer may be reused only in the same verified context; changed employer/country/options/time requires revalidation. Prefer a globally reusable skills_years entry only when the owner explicitly confirms that factual skill-years value. Never permanently save a generated motivation draft as a universal owner fact.

Conflicting old answer: ask, do not overwrite silently. Update affected readiness requirements/gates after explicit owner confirmation, recompute source hashes and rerun audit/preflight checks. Re-snapshot form, verify same job/session/question and answer options, remove resolved open_questions and update SAME needs_review journal entry under the owned lock. Do not call new-job duplicate gating to create a second application; never clear a submission_uncertain record automatically. If lock released while waiting, reacquire and revalidate state before continuing. Any material change to mission mode/targets/caps requires a new launch briefing. Fill known answer, then shared final safety gate/reservation still required. No Submit just because a question was answered.
