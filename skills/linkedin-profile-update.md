---
name: linkedin-profile-update
version: "1.1.0"
description: Load when the owner asks to change a LinkedIn profile section (headline, About, experience, skills); drafts a diff and saves only after exact-text approval.
triggers:
  - /linkedin-growth profile
  - Update my LinkedIn headline/About
requires_mcp:
  - playwright
preconditions:
  - explicit owner request outside any daily run
  - authorized LinkedIn session
requires_skills:
  - profile-optimizer
verification:
  - owner approved the exact old → new diff
  - after Save the profile page was re-opened and the persisted text matches exactly
  - change recorded in logs/runs/<today>.json steps
---
# LinkedIn Profile Update (on demand only)

## When to Use & Preconditions

Use only on explicit request; never during daily runs.

- **Load when:** /linkedin-growth profile; Update my LinkedIn headline/About.
- **Preconditions (stop if any is false):**
  - explicit owner request outside any daily run
  - authorized LinkedIn session
- **Requires skills:** `profile-optimizer`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

Never run during a daily run. Only when the owner asks.
Use skills/profile-optimizer.md for a current/proposed evidence table and MCP/extension staging. Exact-text approval is mandatory; the extension never saves. Read back persisted changes before claiming success.

1. Ask which section: Headline, About, Experience entry, Skills.
2. Draft the new text from `context/profile.md` + latest insights. Show it in chat as a diff (old → new).
3. **Wait for the owner to reply "approve".** Anything else = revise or stop.
4. Navigate to `https://www.linkedin.com/in/me/`, snapshot, click the pencil button for the section (accessible name contains "Edit").
5. Replace the text field contents, snapshot to verify, then click "Save" — only after approval.
6. Log the change in `logs/runs/<today>.json -> steps` as `linkedin_profile_update`.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Clicking Save after staging without approval → ✅ stop at Save.
- ❌ Reporting "profile updated" from the edit modal → ✅ read back the live profile.
- ❌ Changing dates or titles to match target roles → ✅ facts stay unchanged.

### Self-verification check (before reporting this step complete)
- [ ] owner approved the exact old → new diff
- [ ] after Save the profile page was re-opened and the persisted text matches exactly
- [ ] change recorded in logs/runs/<today>.json steps

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
