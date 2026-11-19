---
name: linkedin-growth
version: "1.3.0"
description: Load when the owner runs /linkedin-growth or asks to review their LinkedIn profile, improve headline/About/experience, align LinkedIn with their CV, optimize for target roles, or draft posts/<=75-word outreach; defaults to DRAFT_ONLY and permits live profile updates only with legitimate Playwright auth plus explicit APPROVE and post-save snapshot verification.
triggers:
  - /linkedin-growth
  - review or audit my LinkedIn profile
  - improve my LinkedIn headline or About section
  - make my LinkedIn profile consistent with my CV
  - optimize my LinkedIn profile for target roles
requires_mcp:
  - none
optional_mcp:
  - playwright
preconditions:
  - verified candidate facts available (context/profile.md + context/cv.md OR session-confirmed CV)
  - accessible LinkedIn profile data (pasted text, LinkedIn Save-to-PDF, screenshot, or read-only signed-in Playwright inspection) and optional target role(s)/JDs
  - DRAFT_ONLY by default; explicit owner APPROVE required before any live LinkedIn Save, Post, or Send
requires_skills:
  - tailor-resume-and-verify
  - outreach-and-interview-prep
  - meta-self-verification
verification:
  - 0-100 Recruiter-SEO scorecard (or CV-consistency gap table) grounded solely in inspected profile sections and verified CV facts
  - every metric, skill, title, and date in proposed rewrites matches verified candidate facts (zero hallucinations, zero AI-slop clichés, zero prose em-dashes)
  - audit and proposed copy saved as DRAFT_ONLY to logs/insights/linkedin-seo-audit-YYYY-MM-DD.md; any user-approved live edit occurred only after explicit APPROVE and passed post-save browser_snapshot verification
---
# Grounded Recruiter-SEO LinkedIn Profile Optimizer (`/linkedin-growth`)

## When to Use & Preconditions

Use when the owner invokes `/linkedin-growth` or naturally asks to review their LinkedIn profile, improve headline/About/experience, make LinkedIn consistent with their CV, optimize for target roles (e.g., React / Full-Stack JS), or draft posts/`<= 75`-word outreach. Never edit LinkedIn profiles as a side effect of `/daily-run`.

- **Load when:** `/linkedin-growth`; `"review my LinkedIn profile"`; `"improve my LinkedIn headline and About section"`; `"make my profile consistent with my CV"`; `"optimize my profile for ... roles"`.
- **Preconditions (stop if any is false):**
  - verified candidate facts available (`context/profile.md` + `context/cv.md` OR session-confirmed CV)
  - accessible LinkedIn profile data (pasted text, LinkedIn `Save to PDF`, screenshot, or signed-in Playwright read-only inspection)
  - `DRAFT_ONLY` by default; explicit owner `APPROVE` required before any live LinkedIn Save, Post, or Send
- **Requires skills:** `tailor-resume-and-verify`, `outreach-and-interview-prep`, `meta-self-verification`. **MCP:** none (`playwright` optional; never equate Playwright availability with LinkedIn authentication or permission).

## Deterministic Step-by-Step Execution

### 1. Mode 1 — Read-Only Profile Inspection & CV-Consistency Gap Check
1. Read verified candidate facts from `context/profile.md` and `context/cv.md` (or ask naturally for the owner's CV if absent). This is the **only** permitted source of claims (employers, dates, titles, tools, metrics).
2. Collect the owner's current LinkedIn sections (`Headline`, `About`, `Experience`, `Featured`, `Skills`) through the cleanest accessible path:
   - Pasted LinkedIn text, `Save to PDF` export, or uploaded screenshots (works 100% offline).
   - OR, if Playwright MCP is connected **and** a named signed-in LinkedIn account indicator is verified, extract read-only via `browser_evaluate` (`3–9 s` pacing; abort immediately on any authwall/CAPTCHA/2FA via `skills/24-circuit-breaker-and-antiban.md` and fall back to pasted/PDF/screenshot input).
3. Identify **Missing Information & CV Inconsistencies** (titles, tenure dates, skills, or projects present in CV vs. LinkedIn; missing headline/About clarity; outdated links) and collect optional target roles or `1–5` target JDs (if optimizing for specific roles like React / Full-Stack JS, extract target keywords directly from those roles/JDs).
4. Partition target keywords into: **Present on LinkedIn**, **Verified-but-Missing (Safe to Surface)**, and **True Gaps (NEVER Claim)**.

### 2. Score Current Profile on the Transparent `0–100` Recruiter-SEO Rubric

Compute and display an honest scorecard grounded in observable evidence:

| Section | Max Score | Scoring Breakdown |
|---|---:|---|
| **1. Headline (`<= 220` chars)** | **25** | Target role title match (`0–10`) + core recruiter-filter stack keywords (`0–10`) + verified concrete impact hook (`0–5`) |
| **2. About Hook & Keywords** | **25** | Above-the-fold first 220-character hook before `"See more"` (`0–8`) + natural verified keyword coverage (`0–10`) + domain clarity & direct CTA (`0–7`) |
| **3. Experience Bullets** | **30** | Concrete action + verified numeric/production outcome (`0–15`) + target seniority/CV parity (`0–10`) + clean human tone with zero AI-slop clichés or prose em-dashes (`0–5`) |
| **4. Featured & Skills Alignment** | **20** | Top skills aligned with CV/target roles (`0–10`) + Featured portfolio/GitHub/case-study links (`0–10`) |
| **Total Recruiter-SEO Score** | **100** | Sum of all 4 sections (`<60` Needs Rebuild · `60–79` Solid Base · `80–100` Recruiter-Ready) |

### 3. Mode 2 — Grounded Section-by-Section Improvements (`DRAFT_ONLY` Default)
1. Generate **Before vs. After** side-by-side copy for requested or low-scoring sections (`Headline <= 220 chars`, 3-part `About`, outcome-led `Experience Bullets`, `Featured & Skills` order, and `CV Consistency Fixes`).
2. Run every drafted line through the **Anti-Hallucination Fact-Check Guard** and **Anti-AI Slop Humanizer** (`skills/03-tailor-resume-and-verify.md`):
   - Zero invented `%`, `$`, team sizes, titles, or years.
   - Zero forbidden clichés (`delve`, `testament`, `tapestry`, `spearheaded`, `synergy`, `moreover`, `furthermore`, `orchestrated`, `hit the ground running`) and zero prose em-dashes (`—`).
3. For any outreach DM or connection note, enforce `<= 75` words and run `node ./bin/cli.mjs pre-submit --draft <file>` (or `--text "<msg>"`) after re-reading `config/invariants.txt`.
4. Save the full audit report and `DRAFT_ONLY` copy to `logs/insights/linkedin-seo-audit-YYYY-MM-DD.md` and re-read to verify existence and formatting (`skills/meta-self-verification.md`).

### 4. Mode 3 — Explicit `APPROVE`-Gated Live Profile Mutations (Optional) & Offline Fallback
1. **`DRAFT_ONLY` is always the default:** Present the scorecard, CV-consistency gaps, and exact Before -> After copy in chat so the owner can review, iterate (`EDIT <section>`), or copy-paste manually.
2. **User-Approved Live Edits (Only When Legitimate Browser Access + Explicit Approval Exist):**
   - Execute a live LinkedIn section edit **ONLY** if: (a) the owner explicitly asks to apply a specific section update in LinkedIn, (b) Playwright MCP is connected **and** a signed-in LinkedIn session for the owner's account is verified (never assume Playwright == auth), and (c) the owner inspects the exact final Before/After text and replies **`APPROVE`** for that specific section.
   - Edit only the approved section, click Save once, wait 3–9 s, reload/re-open the profile view, and verify via a fresh `browser_snapshot` (`skills/meta-self-verification.md`) that the persisted text matches verbatim before reporting `"updated"`.
   - Never bypass CAPTCHA, 2FA, or login walls (`skills/24-circuit-breaker-and-antiban.md`). If browser access or auth is unavailable, deliver the `DRAFT_ONLY` copy and clear manual paste steps cleanly without failing the task.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Clicking LinkedIn `"Edit"`, `"Save"`, `"Post"`, or `"Send"` without explicit `APPROVE` on exact Before/After copy, or assuming Playwright availability equals LinkedIn auth → ✅ default to `DRAFT_ONLY`, check auth explicitly, and re-verify persisted text via fresh `browser_snapshot` after any approved save.
- ❌ Stuffing unverified JD keywords (`Kubernetes`, `Rust`, etc.) into Headline, About, or Skills → ✅ isolate unverified skills under `True Gaps` and never claim them.
- ❌ Dumping 25k-token raw LinkedIn `browser_snapshot` trees into context to read profile sections → ✅ use compact read-only `browser_evaluate` extraction, pasted text, PDF, or screenshots.
- ❌ Writing generic AI-slop headlines (`"Passionate innovator spearheading synergistic solutions — delving into..."`) → ✅ write plain, concrete, verifiable engineering prose.

### Self-verification check (before reporting this step complete)
- [ ] `0–100` scorecard (or CV-consistency gap table) grounded solely in inspected LinkedIn data and verified CV facts
- [ ] every metric, skill, title, and date in proposed rewrites verified against candidate CV/profile (`0` hallucinations, `0` AI-slop clichés, `0` prose em-dashes)
- [ ] audit saved as `DRAFT_ONLY` in `logs/insights/linkedin-seo-audit-YYYY-MM-DD.md` and re-read; any user-approved live edit occurred only after explicit `APPROVE` and passed post-save `browser_snapshot` verification
