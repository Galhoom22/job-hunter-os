---
name: wellfound
version: "1.2.0"
last_verified: "2026-11-18"
description: Load when a target is Wellfound (AngelList Talent) and startup roles must be discovered and an optional founder note drafted truthfully.
triggers:
  - target.platform == wellfound
requires_mcp:
  - playwright
preconditions:
  - readiness gates passed, auth verified via Playwright MCP, and context loaded
requires_skills:
  - discover-and-triage
  - fill-and-apply
verification:
  - stable wellfound posting ID captured
  - founder note grounded in verified facts and approved when required
  - apply flow verified from snapshot
---
# Wellfound / AngelList playbook

## When to Use & Preconditions

Use for Wellfound only.

- **Load when:** target.platform == wellfound.
- **Preconditions (stop if any is false):**
  - readiness gates passed, auth verified via Playwright MCP, and context loaded
- **Requires skills:** `discover-and-triage`, `fill-and-apply`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

Live-unverified. Follow AGENTS.md, shared safety, fresh snapshot/refs and 3–9s pacing. Confirm named owner session; never edit a startup profile or send messages as a search side effect.

### Discovery
1. Open owner-selected role search; inspect role/location/workplace filters. Apply only confirmed preferences; remote does not imply worldwide eligibility.
2. Open role details and read startup stage, product/mission, team, compensation/equity, hiring countries and work authorization restrictions when actually stated. Salary/equity absent stays unknown. Record canonical role ID/URL and `wellfound:<stable-id>`; no stable identity → review.
3. Separate company facts from inference. Pause to read description and score; check journal and cross-board ATS URL. Do not use seniority/title alone to claim fit.

### Founder note / application
1. Snapshot Apply and determine whether it sends immediately or opens a draft. Treat Send application/one-click actions as final submission from the start.
2. For a requested note use 04-fill-and-apply.md: 2–3 sentences connecting an observed mission/product need to one or two verified skills/projects. No invented founder familiarity, lifelong interest, referrals, startup metrics or achievements. Unknown mandatory experience/legal answers still block.
3. Show a standalone founder-message draft for owner approval; do not send unsolicited outreach. A note inside an already authorized application follows the application review/safety gate. Shared profile edits require a separate owner request/approval.
4. Use exact per-job PDF, verify required fields, preferences and consent. External employer link → ATS dispatcher; account creation/manual form → needs_review.
5. Run final gate/reservation, obey dry run and submit once only when allowed. Confirm employer/role receipt, not a changed Apply label. Uncertainty stays review. Journal first, optional Notion second; security challenges abort the entire run.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Writing an enthusiastic note with invented product usage → ✅ ground every claim.
- ❌ Sending a note without approval when required → ✅ wait for APPROVE.
- ❌ Assuming equity/salary filters applied → ✅ verify in snapshot.

### Self-verification check (before reporting this step complete)
- [ ] stable wellfound posting ID captured
- [ ] founder note grounded in verified facts and approved when required
- [ ] apply flow verified from snapshot

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
