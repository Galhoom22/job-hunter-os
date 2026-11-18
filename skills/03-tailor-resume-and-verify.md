---
name: tailor-resume-and-verify
version: "2.0.0"
description: Load when tailoring a CV or cover letter for an eligible job (/tailor-cv or Tier A pre-generation); injects verified facts into templates/ats-resume-template.html, runs the Anti-Hallucination Fact-Check Guard and Anti-AI Slop filter, and exports/verifies PDF via Playwright MCP.
triggers:
  - /tailor-cv <url>
  - Tier A pre-generation
  - eligible job before form upload
requires_mcp:
  - playwright
preconditions:
  - owner-verified context/profile.md, context/cv.md, and context/resume-data.json loaded
  - full expanded job description captured
requires_skills:
  - resume-ingestion
verification:
  - evidence map links every tailored bullet and summary claim to an exact verified fact in context/profile.md
  - fact-check audit confirmed 0 unverified percentages, currency amounts, multipliers, years, dates, employers, degrees, or tools
  - humanized prose contains 0 banned AI-slop clichés and no em-dash overuse
  - tailored HTML and printed PDF (< 200 KB, text-selectable) saved in logs/resumes/<company>-<role>-<job-id>/
---
# Pure AI Tailoring, Fact-Check Guard & Anti-AI Slop

## When to Use & Preconditions

Use per job (`/tailor-cv` never submits applications; daily runs tailor Tier A jobs before upload). All tailoring, fact-checking, and humanizing are performed directly by you following these strict rules.

- **Load when:** `/tailor-cv <url>`; Tier A pre-generation; eligible job before form upload.
- **Preconditions (stop if any is false):**
  - owner-verified `context/profile.md`, `context/cv.md`, and `context/resume-data.json` loaded
  - full expanded job description captured
- **Requires skills:** `resume-ingestion`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

### 1. Build the Evidence Map & Tailor `templates/ats-resume-template.html`
- Create folder `logs/resumes/<company-slug>-<role-slug>-<job-id-slug>/`.
- Extract JD requirements, preferred skills, and location/seniority notes.
- Copy `templates/ats-resume-template.html` to `logs/resumes/<folder>/resume.html`.
- Populate ONLY verified owner facts from `context/profile.md` and `context/resume-data.json`:
  - Tailor the 2–3 sentence **Professional Summary** using only verified roles, years, and stacks relevant to the JD.
  - Reorder **Technical Skills** so JD-matched verified skills appear first (never add unverified JD tools—record missing skills in `tailoring-notes.md`).
  - Reorder and lightly rephrase **Experience / Project** bullets to highlight JD-relevant work while keeping exact employers, titles, `YYYY-MM` dates, and verified metrics intact.
  - Escape HTML special chars (`&`, `<`, `>`, `"`, `'`), keep single-column layout, remove empty sections, and NEVER add `<script>`, remote images/fonts, or hidden white text.
- Write `logs/resumes/<folder>/tailoring-notes.md` with: **What JD asked** -> **What changed** -> **Skill gaps (not claimed in CV)**.
- **Cover Letter (ONLY if the portal requires a cover letter file):** Copy `templates/ats-cover-letter-template.html` to `cover-letter.html` (~150–220 words, grounded facts only), show the exact text in chat, and wait for owner approval before saving/printing `cover-letter.pdf`.

### 2. Anti-Hallucination Fact-Check Guard (Mandatory Before Printing)
Compare EVERY claim in `resume.html` (and `cover-letter.html`) line-by-line against `context/profile.md` and `context/resume-data.json`:
- **Numbers & Metrics:** Check every percentage (`%`), currency figure (`$`, `€`, `£`), multiplier (`3x`, `10x`), user/team headcount, and years-of-experience number. If ANY number does not exist in `context/profile.md` or `context/resume-data.json`, **BLOCK rendering immediately** and revert to truthful qualitative phrasing (or ask the owner to verify the metric first).
- **Entities & Dates:** Check every employer name, job title, start/end date, university, degree, project name, and listed skill. Zero fabricated tools, inflated titles, or stretched dates.

### 3. Anti-AI Slop & Humanizer Filter (Mandatory Before Printing)
Scan every summary sentence, bullet, and cover-letter paragraph and rewrite if ANY of these appear:
- **Banned AI clichés (case-insensitive):** `delve`, `testament`, `tapestry`, `spearheaded`, `synergy`, `thrilled to apply`, `fast-paced environment`, `moreover`, `furthermore`, `leveraged`, `orchestrated`, `passionate about`, `dynamic environment`, `proven track record`, `hit the ground running`, `deeply excited`.
- **Banned em-dash overuse (`—`):** Use **0 em-dashes** inside prose sentences (use periods, commas, or parentheses; structural `Title — Employer` headings are fine).
- **Tone rule:** Write like a direct, practical peer engineer using concrete technical nouns and active plain verbs (`built`, `shipped`, `cut`, `migrated`, `tested`, `debugged`).

### 4. Print & Inspect the PDF via Playwright MCP
- Open `file:///<absolute-path-to>/logs/resumes/<folder>/resume.html` in Playwright MCP (or ask the owner to Chrome `Print -> Save as PDF` with A4, no headers/footers if the MCP server does not expose a PDF print tool).
- Save to `logs/resumes/<folder>/resume.pdf` (and plain-text copy `resume.txt` for portals with plain-text paste boxes).
- Verify the resulting PDF is **<= 200 KB**, has clean formatting with zero placeholder `{{...}}` tokens or cut-off bullets, and selectable text.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Inventing `"improved performance by 40%"` or adding `"Kubernetes"` to match the JD → ✅ keep only verified facts and list missing skills under Gaps.
- ❌ Leaving `"spearheaded synergy in a fast-paced environment — moreover..."` in the summary → ✅ rewrite in crisp plain engineering prose.
- ❌ Uploading a base CV silently when tailoring failed → ✅ fix or pause and inform the owner.

### Self-verification check (before reporting this step complete)
- [ ] evidence map links every tailored bullet and summary claim to an exact verified fact in `context/profile.md`
- [ ] fact-check audit confirmed 0 unverified percentages, currency amounts, multipliers, years, dates, employers, degrees, or tools
- [ ] humanized prose contains 0 banned AI-slop clichés and no em-dash overuse
- [ ] tailored HTML and printed PDF (< 200 KB, text-selectable) saved in `logs/resumes/<company>-<role>-<job-id>/`
