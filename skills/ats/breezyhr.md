---
name: breezyhr
version: "1.1.0"
description: Load when an application's final HTTPS hostname is <company>.breezy.hr (BreezyHR) and the hosted form must be filled, reviewed and submitted safely.
triggers:
  - final hostname <company>.breezy.hr
  - apply-external-ats routes to breezyhr
requires_mcp:
  - playwright
preconditions:
  - run lock owned, preflight exit 0, auth verified, context loaded (daily-run steps 1-3)
  - employer and role on the ATS page match the posting
requires_skills:
  - apply-external-ats
  - fill-form-answers
  - approval-gate
verification:
  - breezyhr:<id> or ATS URL stored in notes for duplicate checks
  - resume upload verified by filename after the auto-parse wait
  - receipt text/URL observed after submit, else needs_review
---
# BreezyHR ATS playbook

## When to Use & Preconditions

Use only on BreezyHR-hosted forms.

- **Load when:** final hostname <company>.breezy.hr; apply-external-ats routes to breezyhr.
- **Preconditions (stop if any is false):**
  - run lock owned, preflight exit 0, auth verified, context loaded (daily-run steps 1-3)
  - employer and role on the ATS page match the posting
- **Requires skills:** `apply-external-ats`, `fill-form-answers`, `approval-gate`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

1. Confirm final HTTPS hostname is <company>.breezy.hr, matching the employer and the posting; lookalike/mismatched domains go to review. Use owner-approved board URLs, never submit to these template homepages.
2. Open owner-provided company board, snapshot positions and canonical /p/<id> role link. Apply To Position opens a form; distinguish required attachments from optional cover letters.
3. Capture employer, role, location, full requirements and stable breezyhr:id. For redirects retain original discovery job_id; store ATS URL in notes to avoid duplicate submissions across boards.
4. Snapshot form before each interaction; use labels/roles/refs with random 3–9 second pacing. Upload through fill-form-answers.md. Verify resume filename and only owner-approved contact/legal answers.
5. Unknown required field, account requirement, CAPTCHA, 2FA or inaccessible upload is NOT a reason to invent answers or inject DOM code. Unknown field -> review; CAPTCHA/2FA -> abort entire run.
6. Next/Continue can be irreversible: inspect accessible text. Before any submitting action reserve journal, validate and re-read caps/deduplication. dry_run stops before submit. Verify confirmation URL/text and receipt before updating applied; uncertain -> needs_review.
7. Use log-application.md for local-first write and Notion upsert. Never retry a timed-out submission automatically.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Filling fields before the resume auto-parse finishes → ✅ upload first, wait, re-snapshot.
- ❌ Treating "Next" as harmless → ✅ read its accessible text; it may submit.
- ❌ Injecting DOM code to reach a hidden input → ✅ use the visible upload control or hand off.

### Self-verification check (before reporting this step complete)
- [ ] breezyhr:<id> or ATS URL stored in notes for duplicate checks
- [ ] resume upload verified by filename after the auto-parse wait
- [ ] receipt text/URL observed after submit, else needs_review

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
