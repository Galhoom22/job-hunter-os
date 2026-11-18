---
name: meta-dom-recovery
version: "1.0.0"
description: Load when a browser step fails because the page changed — stale element ref after a modal or step transition, element missing from the snapshot, focus trapped in an iframe, cookie/overlay blocking clicks, or a lazy-loaded list that needs scrolling — to recover safely with fresh snapshots instead of guessing.
triggers:
  - self-healing-navigation
  - stale or unknown element ref error
  - expected button/field not in snapshot
  - list shows fewer jobs than expected
requires_mcp:
  - playwright
preconditions:
  - the failure is a page-structure problem, not a CAPTCHA, 2FA, warning or rate-limit banner (those abort the run)
  - fewer than 3 consecutive errors so far in this run
requires_skills: []
verification:
  - the recovered element was found in a NEW snapshot by role + accessible name, not by a reused ref
  - recovery used at most 2 attempts per element; further failures were counted as one error
  - no script injection, CSS selector, unhidden input or security bypass was used
---
# Self-healing navigation

## When to Use & Preconditions

Use when a click/type/upload fails or a needed element cannot be found and the page is otherwise normal. Do NOT use it to get past CAPTCHA, 2FA, account warnings, rate limits or login walls — those follow AGENTS.md stop rules or fill-form-answers.md Trap 5.

- **Load when:** self-healing-navigation; stale or unknown element ref error; expected button/field not in snapshot; list shows fewer jobs than expected.
- **Preconditions (stop if any is false):**
  - the failure is a page-structure problem, not a security challenge
  - fewer than 3 consecutive errors so far in this run
- **Requires skills:** none. **MCP:** playwright.

## Deterministic Step-by-Step Execution

Always: wait 3–9 s between actions, take a fresh `browser_snapshot` before every retry, locate elements by role + accessible name (+ nearby label text), never by CSS selector or a ref from an older snapshot. Maximum 2 recovery attempts per element; then it counts as ONE error toward the 3-consecutive-errors stop.

1. **Stale ref after a modal/step transition** (error mentions an unknown/stale ref, or the click did nothing): refs are only valid for the snapshot that produced them. Wait 2–4 s for the transition, snapshot again, find the element by role + name in the new tree, act once.
2. **Element not in the snapshot:**
   a. It may be below the fold: scroll the relevant container in small steps (about one screen), snapshot after each, at most 5 steps.
   b. It may be collapsed: look for "See more", "Show more", "More options", an accordion or a "Next" step; expand it, then snapshot.
   c. It may live in an iframe: check the snapshot for an iframe/frame node; Playwright MCP exposes same-origin and many cross-origin frame contents with their own refs. Use those refs. If the frame content is absent (blocked cross-origin widget), hand off to the owner per fill-form-answers.md Trap 3.
   d. Still absent → the UI changed. Record `ui_drift: <page>, expected "<label>"` in the run's steps and route this job to needs_review with a screenshot. Do not hunt with guesses.
3. **Overlay or cookie banner blocks clicks:** close it with a clearly labelled control. Prefer "Reject non-essential" / "Necessary only" / "Close". Never accept marketing consent or sign up for newsletters to dismiss a banner. If no neutral option exists, ask the owner.
4. **Focus stuck (typing goes nowhere, dropdown keeps closing):** click the field's label or the field itself by ref from a fresh snapshot, then type. For autocomplete, type, wait 2 s, snapshot the listbox, click the matching option (fill-form-answers.md Trap 4).
5. **Lazy-loaded job lists:** loop — snapshot, collect new stable job IDs, scroll a small step, wait 3–9 s. Stop when `max_results` is reached, or when two consecutive scrolls add no new IDs, or after 10 scrolls. Prefer a visible "Next page"/"Load more" control over endless scrolling.
6. **Page navigated unexpectedly** (new tab, redirect): list tabs, select the right one, snapshot, confirm the URL/hostname before acting (apply-external-ats.md).
7. **After recovery** continue the original step exactly where it stopped. If the recovery changed anything already filled in a form (re-render, reload), re-check every field before continuing.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Reusing ref `e123` from before the modal opened → ✅ new snapshot, find by role + name.
- ❌ Running `browser_evaluate` to click a hidden button or unhide a file input → ✅ use the visible control or hand off.
- ❌ Scrolling the whole page in one jump and snapshotting once → ✅ small steps, a snapshot per step, bounded loop.
- ❌ Clicking "Accept all cookies" because it is the biggest button → ✅ choose a necessary-only/close option or ask.
- ❌ Retrying the same failing click 6 times → ✅ two attempts, then count an error and move on.

### Self-verification check (before reporting this step complete)
- [ ] the recovered element was found in a NEW snapshot by role + accessible name, not by a reused ref
- [ ] recovery used at most 2 attempts per element; further failures were counted as one error
- [ ] no script injection, CSS selector, unhidden input or security bypass was used

If the element could not be recovered, the job is needs_review with a screenshot and a `ui_drift` note — not a silent skip.
