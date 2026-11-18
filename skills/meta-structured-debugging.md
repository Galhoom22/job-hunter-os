---
name: meta-structured-debugging
version: "1.0.0"
description: Load when an application form refuses to advance or submit (Next/Submit does nothing, inline errors appear, upload stays pending); diagnoses the root cause from the accessibility tree and fixes it only with verified facts.
triggers:
  - diagnose-automation-failure
  - form shows validation errors after Next/Submit
  - Submit click produced no navigation and no confirmation
requires_mcp:
  - playwright
preconditions:
  - the form is still visible (evidence that nothing was submitted)
  - no CAPTCHA, 2FA, warning or rate-limit banner is present (those abort the run)
requires_skills:
  - fill-and-apply
  - meta-self-verification
verification:
  - the diagnosis (cause, field label, quoted error text) is written to logs/applications-log.json notes
  - every fix used a verified fact; unknown facts became open_questions with needs_review
  - after a changed answer, approval was requested again before any new Submit click
---
# Diagnose automation failure

## When to Use & Preconditions

Use when the form is still on screen after Next/Submit and something blocks progress. If the page changed to a blank screen, a spinner that never ends or a timeout, the outcome is UNCERTAIN — do not use this skill to retry; keep `submission_uncertain` and follow `skills/meta-self-verification.md`.

- **Load when:** diagnose-automation-failure; form shows validation errors after Next/Submit; Submit click produced no navigation and no confirmation.
- **Preconditions (stop if any is false):**
  - the form is still visible (evidence that nothing was submitted)
  - no CAPTCHA, 2FA, warning or rate-limit banner is present
- **Requires skills:** `fill-and-apply`, `meta-self-verification`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

1. **Snapshot and collect symptoms.** Take a fresh `browser_snapshot`. List every node with role `alert`, `aria-invalid="true"`, text containing "required", "invalid", "please", "must", "error", "fix", or an error summary at the top/bottom of the form. Record each as `{field label, exact error text}`.
2. **Classify each symptom** (first match wins):

| Cause | Typical evidence | Fix |
|---|---|---|
| Required field empty | "This field is required", asterisk field with no value | Fill from verified facts; unknown → `open_questions` |
| Format rejected | phone, date, email, URL, postcode, salary errors | Reformat the SAME verified value (split country code, `MM/YYYY`, `https://` prefix, digits only) |
| Autocomplete not selected | typed city/school/company still shows as plain text | Type, wait 2 s, snapshot listbox, click the matching option (`skills/04-fill-and-apply.md` Trap 4) |
| Required checkbox/consent unticked | privacy/terms consent error | Tick only if `gdpr_privacy_consent: true` or owner verified this consent; else `open_questions` |
| Upload not finished / wrong type / too large | spinner on file, "unsupported format", size error | Wait 4 s and re-snapshot; verify PDF <= 200 KB; never upload another person's file |
| Character limit | counter over limit | Shorten the grounded answer; show it again if approval is required |
| Hidden step not completed | error on another tab/step of the form | Navigate back to that step, fix, return |
| Duplicate application | "You have already applied" | Stop; log `skipped` with the quoted text |
| Unknown / custom widget | no readable error, nothing changes | Screenshot, `needs_review`, ask the owner |

3. **Fix one cause at a time**, pacing 3–9 s per action and re-snapshotting after each fix. Never invent a value to satisfy a validator (no fake phone, no "N/A" in required legal fields, no ticking consent the owner did not give).
4. **Re-approve if anything changed.** Any changed answer, file or consent invalidates an earlier `APPROVE` (`skills/04-fill-and-apply.md`). Show the updated summary and wait, unless the mode legitimately allows submission without it.
5. **Retry budget.** At most 2 fix-and-retry cycles per form. The reservation entry stays `needs_review` / `submission_uncertain: true` until `skills/meta-self-verification.md` observes a receipt.
6. **Record the diagnosis** in the job's `notes` in `logs/applications-log.json`: `diagnosis: <cause> | field: "<label>" | error: "<quoted text>" | fix: <what changed or open question>`.
7. **Give up cleanly.** After 2 cycles, or if the cause is unknown: screenshot `logs/screenshots/<safe-job-id>.png`, leave the tab open, set `needs_review` with the diagnosis, count one error toward the 3-consecutive-errors stop, and move to the next job.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Clicking Submit repeatedly hoping it works → ✅ read the error text in the snapshot first.
- ❌ Typing "0000000000" to satisfy a phone validator → ✅ reformat the verified number or ask.
- ❌ Ticking "I agree to be contacted about other roles" to clear an error on a different checkbox → ✅ fix only the field the error names.
- ❌ Treating a timeout as a validation failure and resubmitting → ✅ uncertain outcomes are never retried.
- ❌ Submitting after changing an answer without new approval → ✅ re-run `skills/04-fill-and-apply.md` approval gate.

### Self-verification check (before reporting this step complete)
- [ ] the diagnosis (cause, field label, quoted error text) is written to the job's journal notes
- [ ] every fix used a verified fact; unknown facts became open_questions with needs_review
- [ ] after a changed answer, approval was requested again before any new Submit click
