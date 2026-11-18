# Skill: Apply via External ATS (Greenhouse / Lever / Workday / Ashby) — v1

1. Click the "Apply" link; if a new tab opens, use `browser_tabs` to switch.
2. Identify the ATS from the URL: `boards.greenhouse.io`, `jobs.lever.co`, `myworkdayjobs.com`, `jobs.ashbyhq.com`.
3. **Workday** or any ATS that requires creating an account → status `needs_review` (reason: "account required"). Do not create accounts.
4. Snapshot the form. Fill every field by label using `skills/fill-form-answers.md`:
   - Name / Email / Phone / LinkedIn / Portfolio from `profile.md`.
   - Resume: `browser_file_upload` with `context/resume.pdf`.
   - Cover letter (optional fields): leave empty unless `preferences.cover_letter: true` — then write 120 words max, truthful, from the CV.
   - EEO / demographic questions: use `form-answers.yaml -> eeo` (defaults to "Decline to self-identify").
5. Unknown required question → screenshot, `needs_review`, keep tab open, move on.
6. `dry_run` → stop before Submit. Else click "Submit application", confirm the thank-you page.
