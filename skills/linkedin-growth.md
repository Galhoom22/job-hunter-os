---
name: linkedin-growth
version: "1.3.0"
description: Load when the owner runs /linkedin-growth or asks for a Recruiter-SEO LinkedIn profile audit (0-100 rubric against 3-5 target JDs), grounded section-by-section profile optimization, posts, or <=75-word outreach with explicit APPROVE gating.
triggers:
  - /linkedin-growth
  - audit my LinkedIn profile
  - optimize my LinkedIn
  - LinkedIn Recruiter SEO
requires_mcp:
  - playwright
preconditions:
  - verified context/profile.md and context/cv.md loaded (zero invented metrics or unverified skills)
  - 3-5 target job descriptions available (from chat, logs/resumes/*/interview-dossier.md, or read-only LinkedIn extraction)
  - explicit owner APPROVE required before any live LinkedIn Save, Post, or Send
requires_skills:
  - tailor-resume-and-verify
  - outreach-and-interview-prep
  - meta-self-verification
verification:
  - 0-100 Recruiter-SEO scorecard computed across Headline (25), About Hook & Keywords (25), Experience Bullets (30), and Featured & Skills Alignment (20)
  - every metric, skill, title, and date in proposed rewrites is verified verbatim against context/profile.md and context/cv.md (zero hallucinations, zero AI-slop clichés, zero prose em-dashes)
  - audit and proposed copy saved as DRAFT_ONLY to logs/insights/linkedin-seo-audit-YYYY-MM-DD.md with zero live profile edits until explicit owner APPROVE
---
# Grounded Recruiter-SEO LinkedIn Profile Optimizer (`/linkedin-growth`)

## When to Use & Preconditions

Use when the owner explicitly invokes `/linkedin-growth` or requests a LinkedIn Recruiter-SEO audit, profile copy refresh, LinkedIn post draft, or `<= 75`-word outreach message. Never run profile edits as a side effect of `/daily-run`.

- **Load when:** `/linkedin-growth`; `"audit my LinkedIn profile"`; `"optimize my LinkedIn"`; `"LinkedIn Recruiter SEO"`.
- **Preconditions (stop if any is false):**
  - verified `context/profile.md` and `context/cv.md` loaded (zero invented metrics or unverified skills)
  - 3–5 target job descriptions available (pasted in chat, archived in `logs/resumes/*/interview-dossier.md`, or extracted via read-only Playwright `browser_evaluate`)
  - explicit owner `APPROVE` required before any live LinkedIn Save, Post, or Send
- **Requires skills:** `tailor-resume-and-verify`, `outreach-and-interview-prep`, `meta-self-verification`. **MCP:** `playwright` (optional; works fully offline when the user pastes profile text).

## Deterministic Step-by-Step Execution

### 1. Gather Ground-Truth Profile & 3–5 Target JDs
1. Read `context/profile.md`, `context/cv.md`, and `context/preferences.yaml`. This is the **only** permitted source of factual claims (employers, dates, titles, tools, metrics).
2. Collect the owner's current LinkedIn sections (`Headline`, `About`, `Experience`, `Featured`, `Skills`) either from pasted text/PDF export in chat or via a single read-only Playwright `browser_evaluate` extraction on their own profile page (`3–9 s` pacing; abort immediately on any authwall/CAPTCHA via `skills/24-circuit-breaker-and-antiban.md`).
3. Collect **3–5 representative target JDs** from `logs/resumes/*/interview-dossier.md`, `evals/`, or owner-supplied URLs/text. Extract the recurring **Must-Have Hard Skills**, **Infrastructure/Tooling Keywords**, **Role Titles**, and **Seniority Signals**.
4. Partition every target JD keyword into three buckets before writing a single word:
   - **Present on LinkedIn:** Already visible in Headline/About/Experience/Skills.
   - **Verified-but-Missing (Safe to Surface):** Proven in `context/profile.md` or `context/cv.md`, missing or buried on LinkedIn.
   - **True Gaps (NEVER Claim):** Present in JDs, absent from `context/profile.md` and `context/cv.md`.

### 2. Score Current Profile on the Transparent `0–100` Recruiter-SEO Rubric

Compute and display an honest scorecard grounded in observable evidence:

| Section | Max Score | Scoring Breakdown |
|---|---:|---|
| **1. Headline (`<= 220` chars)** | **25** | Target role title match (`0–10`) + core recruiter-filter stack keywords (`0–10`) + verified concrete impact hook (`0–5`) |
| **2. About Hook & Keywords** | **25** | Above-the-fold first 220-character hook before `"See more"` (`0–8`) + natural verified keyword coverage across target JDs (`0–10`) + domain clarity & direct CTA (`0–7`) |
| **3. Experience Bullets** | **30** | Concrete action + verified numeric/production outcome (`0–15`) + target seniority scope alignment (`0–10`) + clean human tone with zero AI-slop clichés or prose em-dashes (`0–5`) |
| **4. Featured & Skills Alignment** | **20** | Top skills aligned with target JD must-haves (`0–10`) + live Featured portfolio/GitHub/case-study links verified reachable (`0–10`) |
| **Total Recruiter-SEO Score** | **100** | Sum of all 4 sections (`<60` Needs Rebuild · `60–79` Solid Base · `80–100` Recruiter-Ready) |

### 3. Draft Grounded Section-by-Section Optimizations (`DRAFT_ONLY`)
1. Generate **Before vs. After** side-by-side copy for every section scoring below max:
   - **Headline:** 2–3 concise variants (`<= 220` chars) leading with exact target role title + 3–4 verified core stack keywords + 1 verified outcome.
   - **About:** Scannable 3-part structure (strong `<220`-char opening hook, 3–4 verified impact highlights, verified technical stack & collaboration focus).
   - **Experience Bullets:** Rewrite weak duty-only bullets into outcome-led bullets strictly reusing verified metrics from `context/profile.md` / `context/cv.md`.
   - **Featured & Skills:** Recommend exact skill additions (from **Verified-but-Missing** only), skill reorder priority, and reachable Featured links.
2. Run every drafted line through the **Anti-Hallucination Evidence Check** and **Anti-AI Slop Humanizer** (`skills/03-tailor-resume-and-verify.md`):
   - Zero invented `%`, `$`, team sizes, or years.
   - Zero forbidden clichés (`delve`, `testament`, `tapestry`, `spearheaded`, `synergy`, `moreover`, `furthermore`, `orchestrated`, `hit the ground running`) and zero prose em-dashes (`—`).
3. For any outreach DM or connection note requested under `/linkedin-growth`, enforce `<= 75` words and run `node ./bin/cli.mjs pre-submit --draft <file>` (or `--text "<msg>"`) before showing the draft.
4. Save the full audit report and proposed copy to `logs/insights/linkedin-seo-audit-YYYY-MM-DD.md` marked `DRAFT_ONLY`.

### 4. Hard `APPROVE` Gate Before Any Live LinkedIn Edit, Post, or Send
1. Present the `0–100` scorecard, the Verified Keyword Gap Matrix, and the exact side-by-side proposed text in chat.
2. Re-read `config/invariants.txt` (`<500` bytes).
3. Ask explicitly: **"Reply `APPROVE HEADLINE`, `APPROVE ABOUT`, `APPROVE ALL`, or `EDIT <section>` to revise. Nothing will be edited or posted without your exact `APPROVE`."**
4. If the owner explicitly approves a live LinkedIn edit via Playwright MCP:
   - Respect `3–9 s` human pacing jitter between actions.
   - Stage the exact approved text, verify exact text in a fresh `browser_snapshot` before clicking **Save** / **Post** / **Send**, then verify the saved state via `skills/meta-self-verification.md`.
   - Any text change invalidates prior approval.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Stuffing unverified JD keywords (`Kubernetes`, `Rust`, etc.) into Headline, About, or Skills to boost the SEO score → ✅ put unverified skills strictly in `True Gaps` and never claim them.
- ❌ Editing LinkedIn profile fields automatically during `/daily-run` or before explicit `APPROVE` → ✅ keep every recommendation `DRAFT_ONLY` until explicit owner approval.
- ❌ Dumping 25k-token raw LinkedIn `browser_snapshot` trees into context to read profile or JD sections → ✅ use compact read-only `browser_evaluate` extraction or pasted text.
- ❌ Writing generic AI-slop headlines (`"Passionate innovator spearheading synergistic solutions — delving into..."`) → ✅ write plain, concrete, verifiable engineering prose.

### Self-verification check (before reporting this step complete)
- [ ] `0–100` Recruiter-SEO scorecard computed across Headline (`25`), About Hook & Keywords (`25`), Experience Bullets (`30`), and Featured & Skills Alignment (`20`) against 3–5 target JDs
- [ ] every metric, skill, title, and date in proposed rewrites is verified verbatim against `context/profile.md` and `context/cv.md` (zero hallucinations, zero AI-slop clichés, zero prose em-dashes)
- [ ] audit and proposed copy saved as `DRAFT_ONLY` to `logs/insights/linkedin-seo-audit-YYYY-MM-DD.md` with zero live profile edits until explicit owner `APPROVE`
