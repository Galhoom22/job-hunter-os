---
name: linkedin-post
version: "1.1.0"
description: Load when the owner asks to draft or publish a LinkedIn post (/linkedin-growth post); drafts, waits for exact-text approval, then publishes and records the post URL.
triggers:
  - /linkedin-growth post
  - Draft a LinkedIn post about <topic>
requires_mcp:
  - playwright
preconditions:
  - explicit owner request
  - authorized LinkedIn session
requires_skills: []
verification:
  - owner replied approve to the exact final text
  - snapshot before Post shows text identical to the approved draft
  - after posting the post URL is read from the page and recorded in logs/runs/<today>.json steps
---
# LinkedIn Post (draft → approve → publish)

## When to Use & Preconditions

Use only on explicit request; never during daily runs.

- **Load when:** /linkedin-growth post; Draft a LinkedIn post about <topic>.
- **Preconditions (stop if any is false):**
  - explicit owner request
  - authorized LinkedIn session
- **Requires skills:** none. **MCP:** playwright.

## Deterministic Step-by-Step Execution

1. Ask for topic, tone (from `context/profile.md -> voice`), and optional link.
2. Draft ≤ 1,300 characters, 3 hashtags max, no fabricated achievements or numbers.
3. Show the exact final text in chat. **Wait for "approve".**
4. Go to `https://www.linkedin.com/feed/`, click button "Start a post", type into the editor textbox.
5. Snapshot, verify the text matches the approved draft exactly, then click "Post".
6. Record the post URL in `logs/runs/<today>.json -> steps` as `linkedin_post`.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Posting on "looks good, maybe shorten it" → ✅ that is an edit request, not approval.
- ❌ Adding numbers the owner never gave → ✅ no fabricated achievements.
- ❌ Reporting "posted" without the post URL → ✅ verify the published post first.

### Self-verification check (before reporting this step complete)
- [ ] owner replied approve to the exact final text
- [ ] snapshot before Post shows text identical to the approved draft
- [ ] after posting the post URL is read from the page and recorded in logs/runs/<today>.json steps

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
