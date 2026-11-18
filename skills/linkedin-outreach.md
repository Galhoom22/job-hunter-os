---
name: linkedin-outreach
version: "1.1.0"
description: Load when the owner explicitly asks to draft a LinkedIn message to a named person; enforces a 75-word cap and exact-text approval before Send.
triggers:
  - /linkedin-growth outreach
  - Draft a message to <name>
requires_mcp:
  - playwright
preconditions:
  - explicit owner request naming the recipient
  - authorized LinkedIn session
requires_skills: []
verification:
  - countWords(text) <= 75 before showing the draft
  - owner replied approve to the exact text and recipient
  - fresh snapshot before Send shows the same recipient and identical text
---
# Short, approved outreach

## When to Use & Preconditions

Use only on explicit request; never during daily runs.

- **Load when:** /linkedin-growth outreach; Draft a message to <name>.
- **Preconditions (stop if any is false):**
  - explicit owner request naming the recipient
  - authorized LinkedIn session
- **Requires skills:** none. **MCP:** playwright.

## Deterministic Step-by-Step Execution

Draft only on an explicit owner request for a named recipient/context. Use verified owner facts and observed recipient/company information; no invented familiarity, referrals or achievements. At most 75 whitespace-delimited words, checked with bin/agent-rules.mjs countWords before presenting. Never mass-message, invite/connect automatically or send as a daily-run side effect.

Show exact final text and recipient in chat, wait for approve, then re-snapshot and verify recipient and exact text before any Send. Any text/recipient change requires new approval. Missing authorized browser session, security warning or ambiguity stops the action. Record only redacted necessary private audit details and validate. Posts/profile text retain their separate limits; the 75-word cap applies to outreach, not every post.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Sending connection invites in bulk → ✅ never mass-message.
- ❌ Editing the text after approval and sending → ✅ any change needs new approval.
- ❌ Claiming familiarity or a referral → ✅ use only verified facts.

### Self-verification check (before reporting this step complete)
- [ ] countWords(text) <= 75 before showing the draft
- [ ] owner replied approve to the exact text and recipient
- [ ] fresh snapshot before Send shows the same recipient and identical text

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
