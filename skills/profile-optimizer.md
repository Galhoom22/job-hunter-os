---
name: profile-optimizer
version: "1.1.0"
description: Load when the owner asks to audit or improve a LinkedIn, Wellfound or Wuzzuf profile; produces a current-vs-proposed evidence table and stages edits only after exact-text approval.
triggers:
  - /linkedin-growth audit
  - Optimize my profile
requires_mcp:
  - playwright
preconditions:
  - explicit owner request outside any daily run
  - verified profile.md and cv.md
requires_skills: []
verification:
  - every proposed sentence lists its verified fact source
  - Save happened only for sections in the exact-text approval
  - persisted profile read back after Save; otherwise reported as staged/unverified
---
# Interactive profile optimizer — never part of an application run

## When to Use & Preconditions

Use for profile work only; never during application runs.

- **Load when:** /linkedin-growth audit; Optimize my profile.
- **Preconditions (stop if any is false):**
  - explicit owner request outside any daily run
  - verified context/profile.md and context/cv.md
- **Requires skills:** none. **MCP:** playwright.

## Deterministic Step-by-Step Execution

Only on explicit owner request; read verified profile/CV, chosen platform rules and current live profile via authorized MCP snapshots or owner-redacted pasted text. No access means ask for pasted current sections, not invented current content.

1. Audit current Headline, About/Summary, Featured Skills and Experience bullets against confirmed target roles. Preserve employers, dates, tenure, skill levels, credentials and metrics. Explain unsupported keyword gaps outside the proposed profile.
2. Show a side-by-side table: Section | Current exact text | Proposed exact text | Verified fact sources. No fabricated achievements or implied experience. Distinguish rewording from new facts, require confirmation for new facts.
3. Ask for APPROVE of the exact named sections/text. No approval means no field mutation or Save. Application launch consent/auto_high_confidence never covers profile changes. Edits after approval invalidate it.
4. MCP: open correct owner profile modal with fresh accessible snapshots; stage approved text, verify field values and pause at Save. If the exact-text approval explicitly includes Save for these sections, save once and read back the persisted profile; otherwise ask again. No selector guessing or injected DOM bypass. Security challenge stops automation. Wellfound/Wuzzuf labels and account flows may differ; inaccessible controls -> manual handoff.
5. Extension: owner opens the real edit modal, pastes version 1 JSON with profile_approved:true and exact approved Headline/About/Summary labels/values. Apply Profile Edits stages only; the companion NEVER clicks Save. Skills/Experience and rich editors require manual editing. Inspect and Save yourself; copy/read back actual persisted profile to confirm. Extension/profile flags are not evidence that chat approval happened.
6. Capture private confirmation screenshot only without credentials, record the actual result in a schema-valid owned run's steps (validate logs). No receipt/read-back -> report staged/unverified, never saved. If no local tools, ask owner to retain the record manually, never claim a file write.

Profile/post/outreach is distinct from job application approval. Read linkedin-profile-update.md for its existing exact-text rule and linkedin-post.md for posts. Never run profile edits automatically during daily-run.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Adding a skill the CV lacks to match target roles → ✅ list it as a gap outside the profile.
- ❌ Treating launch consent as profile approval → ✅ profile edits need their own APPROVE.
- ❌ Letting the extension click Save → ✅ the companion only stages.

### Self-verification check (before reporting this step complete)
- [ ] every proposed sentence lists its verified fact source
- [ ] Save happened only for sections in the exact-text approval
- [ ] persisted profile read back after Save; otherwise reported as staged/unverified

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
