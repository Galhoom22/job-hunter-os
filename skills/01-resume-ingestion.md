---
name: resume-ingestion
version: "2.0.0"
description: Load when the owner shares a CV in chat, drops a Markdown/text/PDF/DOCX file in context/ or assets/, or needs to build their CV from scratch; reads it directly or via Playwright MCP, extracts facts into context/profile.md and context/cv.md, and warns if scanned or missing details.
triggers:
  - CV pasted in chat
  - PDF or Markdown resume in context/ or assets/
  - build CV from scratch
requires_mcp:
  - playwright
preconditions:
  - owner supplied a CV file, pasted CV text, or asked to build one in chat
requires_skills: []
verification:
  - every extracted employer, title, date, degree, skill, and contact detail was explicitly confirmed by the owner
  - context/profile.md, context/cv.md, and context/resume-data.json contain no unconfirmed or placeholder facts
  - if the source PDF was scanned or unreadable, the owner was warned that ATS parsers may see it as blank
---
# Pure AI CV Ingestion & ATS Profile Builder

## When to Use & Preconditions

Use whenever the owner supplies a CV or asks to set up their profile. You extract and verify facts directly—no external PDF-parsing scripts are needed.

- **Load when:** CV pasted in chat; PDF or Markdown resume in `context/` or `assets/`; build CV from scratch.
- **Preconditions (stop if any is false):**
  - owner supplied a CV file, pasted CV text, or asked to build one in chat
- **Requires skills:** none. **MCP:** playwright (only when opening a local PDF via `file:///`).

## Deterministic Step-by-Step Execution

### 1. Read the CV through the cleanest available path
- **Tier 1 — Pasted text / `.md` / `.txt` / `.json`:** Read the exact text directly with your file-reading tool or from chat.
- **Tier 2 — Local `.pdf` (`assets/resume.pdf` or `context/resume.pdf`):**
  - If your model supports reading PDFs natively, read it directly.
  - Otherwise, open the local file in **Playwright MCP** using its absolute `file:///...` URI (`browser_navigate`), take a `browser_snapshot` (or inspect visible pages), and extract the text faithfully.
- **Tier 3 — Scanned / image-only / garbled PDF:**
  - If no selectable text appears in the snapshot/read, **warn the owner immediately**: `"This PDF appears scanned or exported as shapes/images—ATS parsers may read it as a blank page."`
  - Ask the owner to paste their CV text in chat (or share a `.md`/`.txt` version), then rebuild a clean single-column ATS PDF via `templates/ats-resume-template.html` and Playwright MCP after confirming facts.
- **Tier 4 — No CV yet:**
  - Interview the owner in batches of 3–4 questions (recent roles, employers, `YYYY-MM` start/end dates, core tools, key projects, education, contact links) and build `context/profile.md` + `context/cv.md` + a clean `assets/resume.pdf`.

### 2. Extract structured facts and confirm with the owner
Build a concise **Fact Table** covering:
- Identity & contact: `first_name`, `last_name`, `email`, `phone_country_code`, `phone_national`, `city`, `country`, `linkedin_url`, `github_url`, `portfolio_url`
- Work history: `employer`, `title`, `location`, `start_date` (`YYYY-MM`), `end_date` (`YYYY-MM` or `current: true`), verified bullets (exact numbers/metrics only if written in the CV)
- Education & certifications: `institution`, `degree`, `field_of_study`, `start_date`, `end_date`
- Projects & skills: named projects and exact list of tools/languages (with hands-on years asked separately—never guessed from total tenure)

Present the Fact Table in chat and wait for confirmation or corrections. Warn clearly if dates, phone codes, locations, or metrics are missing.

### 3. Persist verified files to `context/`
Once confirmed:
- Write `context/profile.md` (structured summary, contact metadata, voice, verified highlights).
- Write `context/cv.md` (faithful canonical Markdown CV).
- Write `context/resume-data.json` with `owner_verified: true` and `verified_at` timestamp (for deterministic form repeaters and split phone/name/city fields).

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Guessing `skills_years` from graduation year or job tenure → ✅ ask the owner for exact years per skill.
- ❌ Silently fixing or inventing missing metrics/dates → ✅ flag missing items and keep qualitative bullets until confirmed.
- ❌ Overwriting an owner's original `assets/resume.pdf` without asking → ✅ keep originals intact if rebuilding a clean ATS PDF.

### Self-verification check (before reporting this step complete)
- [ ] every extracted employer, title, date, degree, skill, and contact detail was explicitly confirmed by the owner
- [ ] `context/profile.md`, `context/cv.md`, and `context/resume-data.json` contain no unconfirmed or placeholder facts
- [ ] if the source PDF was scanned or unreadable, the owner was warned that ATS parsers may see it as blank
