---
name: multilingual-adaptation
version: "1.0.0"
description: Load when a job posting, ATS form, or outreach target requires adapting a verified English/Arabic/European CV, cover letter, or <=75-word outreach draft into Arabic (with clean RTL directionality), German, French, or Spanish while keeping 100% of factual claims faithful to context/cv.md.
triggers:
  - adapt CV to Arabic / German / French / Spanish
  - bilingual or RTL resume adaptation
  - translate cover letter or outreach to target job language
requires_mcp:
  - none
optional_mcp:
  - playwright
preconditions:
  - verified source CV facts exist in context/cv.md, context/profile.md, or a session-confirmed CV
  - target language (and optional job description conventions) confirmed
requires_skills:
  - tailor-resume-and-verify
  - outreach-and-interview-prep
  - privacy-pii-shield
verification:
  - translated/adapted CV preserves every employer, date, degree, and metric verbatim from context/cv.md with zero semantic inflation
  - ATS keyword equivalents match the job description terminology naturally without robotic literalism or AI clichés
  - RTL styling (dir="rtl" and Cairo/Noto Sans Arabic stack) is applied cleanly when rendering Arabic HTML/PDF output via Playwright MCP
---
# Multilingual & Cultural CV Adaptation

## When to Use & Preconditions

Adapts resumes, cover letters, form answers, and `<= 75`-word outreach drafts across English, Arabic (RTL), German, French, and Spanish roles while preventing translation drift or hallucinated seniority claims.

- **Load when:** `adapt CV to Arabic / German / French / Spanish`; `bilingual or RTL resume adaptation`; `translate cover letter or outreach to target job language`; `"Create an English CV from my Arabic one"` / `"Create an Arabic version"`.
- **Preconditions (stop if any is false):**
  - verified source CV facts exist in `context/cv.md`, `context/profile.md`, or a session-confirmed CV
  - target language (and optional JD conventions) confirmed
- **Requires skills:** `tailor-resume-and-verify`, `outreach-and-interview-prep`, `privacy-pii-shield`. **MCP:** none (`playwright` optional for PDF export).

## Deterministic Step-by-Step Execution

1. **Preserve Original Source CV & Detect Target Language Norms:**
   - Keep the original source CV file untouched; write translated deliverables (`resume.html`, Word-compatible `resume.doc`, `resume.txt`, optional `resume.pdf`) to a clearly named language folder under `logs/resumes/<slug>-<lang>/`.
   - Inspect the JD (from `browser_snapshot` or pasted text) if targeting a specific job, or apply standard regional conventions for English, Arabic (`dir="rtl"`), German (*Lebenslauf*), French, or Spanish.
   - Note local conventions (e.g., keep technical terms like `TypeScript`, `React`, `PostgreSQL`, `CI/CD` in Latin script inside Arabic/German/French prose for ATS parsers).
2. **Literal Fact Lock (Pre-Translation Guard):**
   - Extract the canonical Fact Table from the confirmed source CV (`context/cv.md` or session CV): employers, exact tenure dates (`YYYY-MM`), degrees, certifications, and numeric metrics.
   - Lock technical proper nouns and brand names so translation never alters job scope (e.g., never translate "Contributor" into "Tech Lead" or "Principal").
3. **Register & Localization Pass:**
   - **Arabic (`ar`):** Keep technical keywords in Latin (`React`, `PostgreSQL`, `Playwright`) or bilingual `اسم المفهوم (Term)` where ATS clarity helps; set `dir="rtl"` and `lang="ar"` on the HTML wrapper when exporting via `tailor-resume-and-verify`.
   - **English (`en`) from Arabic:** Translate verified job titles, degrees, and achievements faithfully into plain active engineering English without inflating titles or fabricating metrics.
   - **German (`de`), French (`fr`), Spanish (`es`):** Use crisp active engineering verbs in formal register; apply regional spelling/punctuation rules and keep `<= 75`-word outreach strictly within cap in the target language.
4. **Back-Translation & Fact Check:**
   - Mentally back-translate every numeric metric, title, and credential to the source CV and verify 1:1 parity.
   - Confirm zero banned AI clichés (including translated equivalents such as "motivierter Teamplayer", "passionné", or "شغوف بـ...") slipped in.
5. **Render, Re-Read & Optional PDF Check:**
   - Write and re-read `resume.html`, Word-compatible `resume.doc`, and `resume.txt` to confirm zero placeholders and clean bidirectional/RTL layout. If Playwright MCP (`--caps=pdf`) is available, export `resume.pdf`; otherwise provide browser `Print -> Save as PDF` instructions.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

- **NEVER** translate a title upward in seniority during localization (e.g., translating "Developer" as "Architect").
- **NEVER** add a language fluency level higher than verified in `context/profile.md`.
- **NEVER** force-translate universal programming stack names if the JD itself keeps them in English.
- **Self-Verification Check:** Before completing, verify every back-translated claim matches `context/cv.md`, ATS keywords mirror the JD's actual language, word limits (`<= 75` words for outreach) hold in the target language, and any Arabic HTML export sets `dir="rtl"`.
