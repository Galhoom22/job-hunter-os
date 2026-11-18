# Fill Form Answers & Resume — v3

Read the "Five ATS form traps" section below before touching any application form; it overrides older wording here.

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


## Five ATS form traps (mandatory)
Structured facts come from verified `context/resume-data.json` (`owner_verified: true`, checked with bin/resume-data.mjs). If it is missing or unverified, the affected fields are UNKNOWN → needs_review; never derive them by guessing from free text.

### Trap 1 — Upload FIRST (auto-parse overwrites)
Lever, Workday, SmartRecruiters, Greenhouse, Ashby, Workable and many Easy Apply modals parse the uploaded resume and overwrite text fields.
1. Snapshot the fresh form, locate the resume control and upload the job's file before typing anything (Trap 2/3 for how).
2. Wait 4 seconds (this counts as that step's 3–9 s pacing), then take a NEW `browser_snapshot`. Old element refs are stale after parsing.
3. Only then fill and correct every field. Treat parser-filled values as untrusted: compare each with resume-data.json and fix wrong names, split dates, employers, titles, phone codes or locations. Parser-created extra work/education rows that do not match verified data are removed or corrected, never accepted silently.
4. If the form re-parses later (second upload, page reload), repeat steps 2–3.

### Trap 2 — Absolute paths only
`browser_file_upload` needs full OS paths. Resolve every file from the agent home to an absolute path first (`/Users/<name>/.job-hunter-os/logs/resumes/<folder>/resume.pdf`, `C:\Users\<name>\.job-hunter-os\logs\resumes\<folder>\resume.pdf`). render-cv prints absolute paths; reuse them exactly. Never pass `./logs/...` or `~`. Confirm the file exists immediately before upload.

### Trap 3 — Hidden drag-and-drop zones
File inputs are often `display:none` and missing from the accessibility snapshot.
1. Click the visible control that owns the upload ("Upload resume", "Attach", "Browse", "Drop files here", the dropzone itself). When Playwright MCP reports an open file chooser, call `browser_file_upload` with the absolute path. Do not inject scripts, unhide inputs or use guessed CSS selectors.
2. Pick the right slot: resume vs cover letter vs "other documents". Never put a resume into a cover-letter slot.
3. If no chooser opens (cross-origin iframe dropzone, custom widget), PAUSE on that field and post in chat:
   > "This form's upload box blocks automation. Please drag this file into the highlighted box in the open browser window, then reply `CONTINUE`:
   > `<absolute path>`"
   Wait. After `CONTINUE`, snapshot and verify the displayed filename; then continue with Trap 1 step 2. No reply → needs_review with the tab left open.
4. Format choice: PDF by default; `resume.docx` if only .doc/.docx is accepted (`resume.doc` only when .docx is rejected); paste `resume.txt` contents into "plain-text resume" boxes. Respect stated size limits (render-cv keeps PDFs under 200 KB).

### Trap 4 — Split name, phone and location autocomplete
- **Names:** separate First/Last fields → `first_name` / `last_name`. A single "Full name" → `full_name` if present, else `first_name + " " + last_name`. Middle-name or "preferred name" fields only from verified data; otherwise leave optional fields empty.
- **Phone:** if there is a country-code dropdown or prefix field, select the option whose dialling code equals `phone_country_code` (for example `+20` Egypt) — match by code, not by the first country name — and type `phone_national` into the number field. A single phone field → `phone_country_code + " " + phone_national` unless its placeholder shows a national format. Never duplicate the country code (`+20 +20…`).
- **Location/City autocomplete:** type `city_autocomplete`, wait 2 seconds, snapshot the dropdown, and click the option that matches `city_autocomplete_match` (or city + country). Use the first suggestion only when it matches; if none matches, clear the field and try the city name once more; still nothing → UNKNOWN/needs_review. Typed text without a selected option is often rejected silently, so verify the field shows the selected value.
- **Repeaters ("Add work experience", "Add education"):** fill from `work_history[]` / `education[]` in order, one row per entry, `YYYY-MM` split into month/year dropdowns, `current: true` → tick "I currently work here" and leave the end date empty. Stop at the number of verified rows.

### Trap 5 — Session expired / login wall mid-run
If navigation to a job or Apply shows "Sign in", "Join now", "Log in to apply" or an account chooser instead of the job/form:
1. Do not type credentials, create an account, click OAuth buttons or retry in a loop. Stop actions on that platform and keep the run lock.
2. Post: "Your session on <Platform> expired. Please sign in in the open browser window (if that window is closed, run `npx github:redasalem/job-hunter-os login`), then reply `CONTINUE`." The owner completes any password/2FA privately; take no snapshots while they type.
3. On `CONTINUE`: re-verify the platform's auth indicator exactly as daily-run step 2, re-open the same job URL, re-check its `job_id` against the log and resume where you left off with a fresh snapshot. Every other gate is re-checked.
4. Abort the run (status `aborted`, reason `session_expired`) if the owner does not reply `CONTINUE`, if the wall comes back after sign-in, or if it comes with a CAPTCHA, account warning or rate-limit banner.
