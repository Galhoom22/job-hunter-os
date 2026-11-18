---
name: multilingual-adaptation
version: "1.0.0"
description: Load when a job posting, ATS form, or outreach target requires adapting a verified English/Arabic/European CV, cover letter, or <=75-word outreach draft into Arabic (with clean RTL directionality), German, French, or Spanish while keeping 100% of factual claims faithful to context/cv.md.
triggers:
  - adapt CV to Arabic / German / French / Spanish
  - bilingual or RTL resume adaptation
  - translate cover letter or outreach to target job language
requires_mcp:
  - playwright
preconditions:
  - verified source CV facts exist in context/cv.md and context/profile.md
  - target language and full captured job description language conventions are confirmed
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

- **Load when:** `adapt CV to Arabic / German / French / Spanish`; `bilingual or RTL resume adaptation`; `translate cover letter or outreach to target job language`.
- **Preconditions (stop if any is false):**
  - verified source CV facts exist in `context/cv.md` and `context/profile.md`
  - target language and full captured job description language conventions are confirmed
- **Requires skills:** `tailor-resume-and-verify`, `outreach-and-interview-prep`, `privacy-pii-shield`. **MCP:** `playwright`.

## Deterministic Step-by-Step Execution

1. **Detect Posting Language & Regional Norms:**
   - Inspect the full JD in `browser_snapshot` or pasted text to determine whether the employer expects English, Arabic, German (*Lebenslauf* style), French, or Spanish.
   - Note local conventions (e.g., whether official technical terms such as `TypeScript`, `Kubernetes`, `PostgreSQL`, `CI/CD` must stay in Latin script inside Arabic/German/French prose for ATS parsers).
2. **Literal Fact Lock (Pre-Translation Guard):**
   - Extract the canonical Fact Table from `context/cv.md`: employers, exact tenure dates (`YYYY-MM`), degrees, certifications, and numeric metrics.
   - Lock technical proper nouns and brand names so translation never alters job scope (e.g., never translate "Contributor" into "Tech Lead" or "Principal").
3. **Register & Localization Pass:**
   - **Arabic (`ar`):** Keep technical keywords in Latin (`React`, `PostgreSQL`, `Playwright`) or bilingual `اسم المفهوم (Term)` where ATS clarity helps; set `dir="rtl"` and `lang="ar"` on the HTML wrapper when exporting via `tailor-resume-and-verify`.
   - **German (`de`), French (`fr`), Spanish (`es`):** Use crisp active engineering verbs in formal register; apply regional spelling/punctuation rules and keep `<= 75`-word outreach strictly within cap in the target language.
4. **Back-Translation & Fact Check:**
   - Mentally back-translate every numeric metric, title, and credential to English and verify 1:1 parity against `context/cv.md`.
   - Confirm zero banned AI clichés (including their translated equivalents such as "motivierter Teamplayer", "passionné", or "شغوف بـ...") slipped in.
5. **Render & Visual Check (When Exporting PDF):**
   - For tailored PDFs, export via Playwright MCP (`page.pdf`) and inspect `browser_snapshot` / rendered PDF page count to ensure RTL alignment, margins, and Latin-in-RTL bidirectional punctuation render cleanly without clipping.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

- **NEVER** translate a title upward in seniority during localization (e.g., translating "Developer" as "Architect").
- **NEVER** add a language fluency level higher than verified in `context/profile.md`.
- **NEVER** force-translate universal programming stack names if the JD itself keeps them in English.
- **Self-Verification Check:** Before completing, verify every back-translated claim matches `context/cv.md`, ATS keywords mirror the JD's actual language, word limits (`<= 75` words for outreach) hold in the target language, and any Arabic HTML export sets `dir="rtl"`.
