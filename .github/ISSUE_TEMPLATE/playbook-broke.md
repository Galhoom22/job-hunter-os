---
name: Playbook Broke (DOM / ATS UI Change)
about: Report a job board or employer ATS form whose accessibility tree or flow changed
title: "[Playbook Broke] <Platform / ATS Name>: <Brief summary>"
labels: ["playbook-maintenance", "help wanted"]
---

## 1. Platform or ATS Engine
- **Playbook file:** (e.g., `skills/platforms/linkedin.md`, `skills/ats/greenhouse.md`)
- **Last Verified Date in Frontmatter:** (e.g., `2026-11-18`)
- **Observed URL Pattern (redact private tokens/IDs):** `https://...`

## 2. What Changed in the UI / Accessibility Tree?
Describe which step failed (e.g., `"Easy Apply Next button label changed"`, `"Resume upload confirmation badge not detected"`, `"New mandatory dropdown added"`).

## 3. Redacted `browser_snapshot` Snippet
> **Privacy Reminder (`skills/14-privacy-pii-shield.md`):** Remove your real name, email, phone number, session cookies, and private tokens before pasting!

```yaml
# Paste the relevant 10-30 lines from Playwright MCP browser_snapshot here:
```

## 4. Proposed Playbook Update (Optional)
Which role/label/condition in the playbook should be updated?
