# Skill: Apply via Easy Apply (LinkedIn / Wuzzuf / Wellfound internal) — v1

Precondition: score passed, caps OK, `job_id` not in log.

1. On the job detail page, `browser_snapshot`, click button "Easy Apply" (or "Apply").
2. A dialog opens (role `dialog`). Loop over steps:
   a. Snapshot the dialog. For every form field (textbox, combobox, radio group, checkbox):
      - Run `skills/fill-form-answers.md` to resolve the answer.
      - Unknown → STOP this application: `browser_take_screenshot` to `logs/screenshots/<job_id>.png`,
        leave the tab open, return status `needs_review` with the question text.
   b. Resume upload: choose the existing resume entry matching `profile.md -> resume_file_name`; if upload required use `browser_file_upload` with `context/resume.pdf`.
   c. Click "Next" / "Review" / "Continue".
3. On the "Review" step: snapshot and verify name, email, phone.
4. If `dry_run: true` → do NOT click "Submit application". Close dialog with "Dismiss" → "Discard". Status `dry_run`.
5. Otherwise click "Submit application", wait, snapshot, confirm text like "Application sent". Status `applied`.
6. Uncheck "Follow company" if present before submit (unless `preferences.follow_companies: true`).
