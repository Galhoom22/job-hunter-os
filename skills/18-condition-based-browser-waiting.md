---
name: condition-based-browser-waiting
version: "1.0.0"
description: Load whenever waiting on Playwright MCP page transitions, file upload parsing, multi-step ATS modals, or lazy-loaded job lists; replaces blind fixed sleeps with deterministic browser_snapshot condition checks and enforces semantic locator priority (Role -> Label -> Placeholder -> Text) while preserving human pacing delays.
triggers:
  - waiting for page / upload / modal in Playwright MCP
  - flaky browser step or timing mismatch
  - choose resilient element locator in browser_snapshot
requires_mcp:
  - playwright
preconditions:
  - Playwright MCP browser tab is open on the target job board or ATS form
  - action is part of an active discovery, upload, or fill step (no CAPTCHA, 2FA, or rate-limit banner present)
requires_skills:
  - meta-dom-recovery
  - fill-and-apply
verification:
  - condition check observed explicit completion signal (e.g., filename badge visible, Next button enabled, spinner gone) in browser_snapshot before proceeding
  - element targeting used semantic accessibility attributes (Role -> Label -> Placeholder -> Text) and zero hardcoded CSS classes or XPaths
  - condition-based snapshot verification ran first, followed by a single 3-9s human pacing jitter between page submissions/navigations
---
# Condition-Based Browser Waiting & Locator Priority (Adapted from `obra/superpowers`)

## When to Use & Preconditions

Eliminates premature clicks and stale-ref failures caused by guessing wait times during SPA navigation, ATS resume parsing, or dynamic dropdowns — while keeping `AGENTS.md` anti-bot pacing intact.

- **Load when:** `waiting for page / upload / modal in Playwright MCP`; `flaky browser step or timing mismatch`; `choose resilient element locator in browser_snapshot`.
- **Preconditions (stop if any is false):**
  - Playwright MCP browser tab is open and no security stop condition (`CAPTCHA`, `2FA`, warning banner) is visible.
- **Requires skills:** `meta-dom-recovery`, `fill-and-apply`. **MCP:** `playwright`.

## Deterministic Step-by-Step Execution

1. **Apply Semantic Locator Priority (Never CSS/XPath):**
   - Select targets from the fresh accessibility tree (`browser_snapshot`) strictly in this precedence order:
     1. **Role + Accessible Name:** e.g., button `"Next"`, link `"Senior Backend Engineer"`, textbox `"Email"`.
     2. **Form Label:** exact `<label>` association shown in the snapshot.
     3. **Placeholder:** when an input lacks an explicit label.
     4. **Visible Exact Text:** fallback only for static triggers/tabs.
   - **Never** rely on obfuscated CSS classes (e.g., `.css-1a2b3c`), positional DOM indices, or cached `ref` IDs from an earlier snapshot.
2. **Wait for Exact Observable Conditions (Not Blind Guess Sleeps):**
   - After triggering an async UI change, define the exact **completion condition** to verify in `browser_snapshot` (with a bounded timeout, typically 15–20 seconds):
     - **CV Upload (`skills/04-fill-and-apply.md`):** wait until `Uploading...` / progress bar clears **and** the exact filename (`resume.pdf`) or `Remove file` button appears in `browser_snapshot`.
     - **Modal / Next Step Transition:** wait until the previous step heading disappears and the new step heading / form controls mount cleanly in `browser_snapshot`.
     - **Search Autocomplete / Typeahead (Location / School / React-Select Portals):** click the combobox first to open it, type query, wait until `listbox` / `option` portal nodes render in `browser_snapshot` (often at document root), then click matching option rather than pressing `Enter` blindly.
     - **Embedded Iframes (`#grnhse_iframe`, etc.):** verify iframe frame context in `browser_snapshot` and switch into the embedded ATS frame (`skills/meta-dom-recovery.md`) before resolving control refs.
     - **Dynamic Spinner / Skeleton:** take a fresh `browser_snapshot` after a bounded pause (`browser_wait_for` text/gone if available, or 2–3 bounded snapshot re-checks); if still loading past timeout, escalate to `skills/meta-dom-recovery.md` rather than clicking twice.
3. **Unified Timing Rule (Condition Check + Single 3–9 s Submission Jitter):**
   - Wait purely on `browser_snapshot` readiness conditions during uploads, modals, and portal dropdowns (do not stack arbitrary blind sleeps).
   - Once verified ready, apply a single random **3–9 second human pacing jitter** between page navigations and form submissions (`AGENTS.md` Guardrail #2).

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

- **NEVER** assume a resume uploaded or form submitted just because a fixed 2–4 s timer elapsed — verify the new state in `browser_snapshot`.
- **NEVER** poll in tight sub-second loops or exceed 3 consecutive wait/recovery failures without aborting per `AGENTS.md`.
- **NEVER** target elements by styled-component hashes or guessed CSS selectors when accessibility role/label exists.
- **Self-Verification Check:** Before interacting with the next control, confirm a fresh `browser_snapshot` shows the expected completion condition (spinner gone, modal ready, file badge rendered) and you resolved a fresh accessibility `ref` via `Role -> Label -> Placeholder -> Text`.
