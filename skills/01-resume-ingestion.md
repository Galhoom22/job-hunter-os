---
name: resume-ingestion
version: "2.0.0"
description: Load when the owner shares or uploads a CV in chat, drops a PDF/DOCX/DOC/MD/TXT file in context/ or assets/, wants to review or edit an existing CV, or needs to create a CV from scratch; reads via the best local reader (or optional Playwright MCP for PDFs), verifies facts, and preserves original files.
triggers:
  - CV pasted or uploaded in chat
  - PDF, DOCX, DOC, or Markdown resume in context/ or assets/
  - review or edit existing CV
  - create CV from scratch
requires_mcp:
  - none
optional_mcp:
  - playwright
preconditions:
  - owner supplied a CV file/text or asked to review, edit, or create a CV
requires_skills: []
verification:
  - every extracted or added employer, title, date, degree, skill, and contact detail was explicitly confirmed by the owner
  - context/profile.md, context/cv.md, and context/resume-data.json contain no unconfirmed or placeholder facts
  - edits preserve the original source CV file and if a PDF was scanned or unreadable the owner was warned with paste/text alternatives
---
# Complete CV Management: Ingestion, Creation & Surgical Editing

## When to Use & Preconditions

Use whenever the owner uploads, pastes, drops, reviews, edits, converts, or creates a CV from scratch—either standalone or as part of `/setup` or `/quick-tailor`. No full Career OS setup or browser login is required.

- **Load when:** CV pasted or uploaded in chat; PDF/DOCX/DOC/MD/TXT resume in `context/` or `assets/`; review or edit existing CV; create CV from scratch.
- **Preconditions (stop if any is false):**
  - owner supplied a CV file/text or asked to review, edit, or create a CV
- **Requires skills:** none. **MCP:** none (`playwright` optional only when opening a local `.pdf` via `file:///` without native PDF reading).

## Deterministic Step-by-Step Execution

### 1. Import Existing CV (or Create from Scratch) Through the Best Local Path
- **Tier 1 — Pasted text / `.md` / `.txt` / `.json` / `.html`:** Read directly from chat or local files with IDE file tools.
- **Tier 2 — Local `.docx` / readable `.doc`:** Extract text cleanly using `node ./bin/cli.mjs audit <path>` (built-in ZIP/XML `.docx` reader) or accessible document tools. Never send CVs to external conversion APIs without explicit owner authorization.
- **Tier 3 — Local `.pdf` (`assets/resume.pdf` or user-supplied path):**
  - Read natively if your runtime supports PDF reading; otherwise open `file:///<absolute-path>` in optional **Playwright MCP** (`browser_navigate` -> `browser_snapshot`) to extract selectable text.
- **Tier 4 — Scanned, image-only, encrypted, or corrupted file:**
  - Explain clearly what failed (`"This PDF appears scanned/image-only or unreadable—ATS parsers may see it as blank"`). Never silently extract partial text as complete; offer pasted text or `.md`/`.txt`/`.docx` instead.
- **Tier 5 — Create a New CV from Scratch (Guided Interview):**
  - If the owner has no CV yet, interview them in small batches of 3–4 questions covering: (1) target role + contact/links, (2) recent work history (`employer`, `title`, `YYYY-MM` start/end dates, responsibilities, confirmed metrics), (3) projects + technologies, and (4) education/certifications.
  - Present the complete Fact Table for explicit confirmation before writing `context/profile.md`, `context/cv.md`, and `context/resume-data.json`, then render a clean ATS CV (`skills/03-tailor-resume-and-verify.md`).

### 2. Extract Structured Facts, Review & Confirm with the Owner
Build a concise **Fact Table** covering:
- Identity & contact: `first_name`, `last_name`, `email`, `phone_country_code`, `phone_national`, `city`, `country`, `linkedin_url`, `github_url`, `portfolio_url`
- Work history: `employer`, `title`, `location`, `start_date` (`YYYY-MM`), `end_date` (`YYYY-MM` or `current: true`), verified bullets (exact numbers/metrics only if written in the CV)
- Education & certifications: `institution`, `degree`, `field_of_study`, `start_date`, `end_date`
- Projects & skills: named projects and exact list of tools/languages (ask hands-on years separately—never guess from tenure)

If the owner asked to **review/improve** their CV, pair the Fact Table with actionable structural/content feedback (clarity, action verbs, missing quantifiable scope questions—never invented metrics) and ask whether they want general improvements or tailoring to a target job. Wait for confirmation/corrections on uncertain items.

### 3. Persist Verified Facts to `context/` (When Confirmed)
Once confirmed (or when setting up `context/`):
- Write `context/profile.md`, `context/cv.md`, and `context/resume-data.json` with `owner_verified: true` and `verified_at`.
- For standalone single-CV edits where the owner did not ask to overwrite `context/`, keep confirmed session facts in working state and save deliverables to `logs/resumes/<slug>/`.

### 4. Surgical Editing of an Existing CV (Preserve Originals)
When the owner requests edits (*"make my summary stronger"*, *"improve these bullets"*, *"add a project"*, *"reorder skills"*, *"remove outdated section"*, *"shorten to one page"*, *"adapt for senior role"*, *"create English/Arabic version"*, or *"keep design, improve content"*):
1. Read the source CV first and **preserve the original file intact** (never silently overwrite `assets/resume.pdf` or the source file; write revised files to `logs/resumes/<slug>/` unless overwriting is explicitly requested).
2. Modify ONLY the requested sections using verified facts (`skills/15-multilingual-adaptation.md` for Arabic/English/EU translation; `skills/03-tailor-resume-and-verify.md` for HTML/DOC/TXT/optional PDF generation and Anti-AI Slop checks).
3. Re-read every written file to verify 0 `{{...}}` placeholders, intact formatting, and factual accuracy (`skills/meta-self-verification.md`), then report exact output paths and material changes. Support follow-up edits (`"change the summary"`) directly without restarting.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Guessing `skills_years`, metrics, or job titles → ✅ flag gaps and ask the owner.
- ❌ Silently treating a scanned/unreadable PDF as complete → ✅ warn honestly and offer paste/text alternatives.
- ❌ Overwriting the owner's original CV file or sending CVs to external web converters → ✅ preserve originals and process locally.

### Self-verification check (before reporting this step complete)
- [ ] every extracted or added employer, title, date, degree, skill, and contact detail was explicitly confirmed by the owner
- [ ] `context/profile.md`, `context/cv.md`, and `context/resume-data.json` (when written) contain no unconfirmed or placeholder facts
- [ ] edits preserved the original source CV, re-read output files, and warned honestly if a source document was scanned or unreadable
