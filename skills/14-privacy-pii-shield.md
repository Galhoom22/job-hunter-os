---
name: privacy-pii-shield
version: "1.0.0"
description: Load whenever sanitizing job-hunt outputs for screenshots, demo showcases, public repositories, Git commits, or external sharing; redacts real emails, phone numbers, home addresses, passport/national ID numbers, auth cookies, and API tokens before display or commit.
triggers:
  - redact PII before sharing
  - privacy shield audit
  - check repo for leaked secrets or personal data
  - sanitize resume or log snippet for export
requires_mcp:
  - none
preconditions:
  - target text, markdown, HTML/PDF preview, log file, or git tracked file list is available to inspect
requires_skills:
  - log-and-insights
  - tailor-resume-and-verify
verification:
  - zero real email addresses, phone numbers, street addresses, IDs, .env values, or session cookies remain in any shareable or committed artifact
  - context/* (except *.example), logs/, assets/*.pdf, and browser-profile/ remain excluded from git tracking
  - every masked field uses clear synthetic placeholders (e.g., [REDACTED_EMAIL], +1-555-0100) rather than altered factual work claims
---
# Privacy & PII Redaction Shield

## When to Use & Preconditions

Ensures personal contact details, government IDs, browser session cookies, and API secrets never leak into terminal screenshots, example directories, shared prompts, or Git commits.

- **Load when:** `redact PII before sharing`; `privacy shield audit`; `check repo for leaked secrets or personal data`; `sanitize resume or log snippet for export`.
- **Preconditions (stop if any is false):**
  - target text, markdown, HTML/PDF preview, log file, or git tracked file list is available to inspect
- **Requires skills:** `log-and-insights`, `tailor-resume-and-verify`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **Classify Sensitivity Tier:**
   - **Never Expose Anywhere (Hard Secrets):** `.env` keys, Notion tokens, `NPM_TOKEN`, cookies, Playwright `browser-profile/` storage state, government IDs, passport numbers, tax IDs.
   - **Application-Only PII (OK in private tailored PDF/ATS form, redact in public demos/screenshots):** owner legal full name (if pseudonymized mode enabled), personal email, phone number, street address, exact DOB, compensation history.
2. **Pre-Share / Demo Redaction Pass:**
   - Replace sensitive strings cleanly using deterministic tokens:
     - Email -> `[REDACTED_EMAIL]` or `candidate@example.invalid`
     - Phone -> `[REDACTED_PHONE]` or `+1-555-0100`
     - Street/City address (if private) -> `[CITY_TIMEZONE_REDACTED]`
     - Auth headers/tokens/URLs with query tokens -> `[REDACTED_TOKEN]`
   - Preserve technical experience, dates, and role context cleanly without fabricating metrics.
3. **Repository & `.gitignore` Pre-Commit Guard:**
   - Verify tracked files via IDE tools or `git ls-files` never include `context/profile.md`, `context/cv.md`, `context/resume-data.json`, `context/form-answers.yaml`, `context/preferences.yaml`, `context/targets.yaml`, `logs/`, `assets/*.pdf`, `.env`, `.mcp.json`, or `browser-profile/`.
   - If any personal file is staged or tracked, stop immediately and alert the owner before pushing or capturing outputs.
4. **GDPR / Retention Reminder for Employers:**
   - When filling EEA/UK ATS forms requiring consent checkboxes, record the consent text verbatim in `logs/applications-log.json` notes and confirm it matches `context/form-answers.yaml` preferences before submission.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

- **NEVER** print cookies, `Authorization` headers, `.env` secrets, or `browser-profile/` contents into chat responses or artifacts.
- **NEVER** replace real company names or dates with fake performance metrics when redacting; only mask personal identifiers and credentials.
- **NEVER** commit real user `context/*` or `logs/*` files when preparing examples or open-source PRs.
- **Self-Verification Check:** Before completing, re-read the sanitized output or tracked file list to confirm zero real emails, phone numbers, street addresses, IDs, or tokens remain visible.
