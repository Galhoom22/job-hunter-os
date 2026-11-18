---
name: fact-check-guard
version: "1.0.0"
description: Load when a tailored resume, cover letter, or application answer is drafted and before rendering PDFs; verifies every number, date, employer, degree, project, and skill against verified owner context and blocks rendering on fabrication.
triggers:
  - before render-cv on any tailored resume
  - verify-cv check
  - after drafting tailored bullets or summary
requires_mcp:
  - none
preconditions:
  - owner-verified context/resume-data.json or context/profile.md and context/cv.md exist
  - tailored payload (.json, .html, .md, or .txt) is written locally
requires_skills:
  - tailor-resume
verification:
  - node bin/job-hunter.mjs verify-cv <tailored-file> exited 0 with zero errors
  - every percentage, dollar/currency figure, multiplier, headcount, and year matches verified owner sources
  - no unverified employer, institution, degree, project, or tool was added
---
# Anti-Hallucination Resume Fact-Checker

## When to Use & Preconditions

Run after drafting any tailored resume or cover letter and BEFORE uploading or treating a rendered PDF as ready.

- **Load when:** before `render-cv` on any tailored resume; `verify-cv` check; after drafting tailored bullets or summary.
- **Preconditions (stop if any is false):**
  - owner-verified `context/resume-data.json` or `context/profile.md` and `context/cv.md` exist
  - tailored payload (`.json`, `.html`, `.md`, or `.txt`) is written locally
- **Requires skills:** `tailor-resume`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **Enforce strict rewrite boundaries:**
   - You MAY rephrase verified bullets for clarity, surface relevant verified keywords, and reorder existing bullets/skills.
   - You MUST NEVER invent metrics (`40%`, `$2M`, `10x`, `15 engineers`), inflate years of experience, add unverified tools/frameworks, change employment dates, or invent degrees/projects.
2. **Run the deterministic CLI fact-checker:**
   - Execute:
     ```bash
     node bin/job-hunter.mjs verify-cv logs/resumes/<folder>/payload.json
     ```
     (or against `resume.html` / `resume.txt` if edited manually).
   - `verify-cv` compares every numeric/metric token (`%`, `$`/`€`/`£`, `Nx`, years, headcounts, dates) and every employer, institution, degree, project, and skill against `context/resume-data.json`, `context/profile.md`, and `context/cv.md`.
3. **Render only after verification passes:**
   - `node bin/job-hunter.mjs render-cv <file>` automatically invokes `verifyTailoredCv` when verified baseline context is present and **blocks PDF/DOCX rendering** if any unverified metric or entity is detected.
4. **Fix any failure at the source:**
   - If `verify-cv` exits non-zero:
     - Remove or revert the unverified number/tool/entity back to the exact verified wording in `context/resume-data.json` / `context/profile.md`.
     - If the owner actually has that metric or skill in real life, ask the owner to confirm it first and save it to verified context before using it.
   - Re-run `verify-cv` until it exits `0`, then re-run `render-cv`.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Adding `"reduced latency by 35%"` when `context/profile.md` only says `"improved API latency"` → ✅ keep truthful qualitative phrasing unless the owner confirms a metric.
- ❌ Adding `"Kubernetes"` to skills because the JD asks for it → ✅ record it under `tailoring_notes.gaps` instead.
- ❌ Ignoring a `verify-cv` failure and printing the HTML manually → ✅ resolve every flagged mismatch before rendering or uploading.

### Self-verification check (before reporting this step complete)
- [ ] `node bin/job-hunter.mjs verify-cv <tailored-file>` exited 0 with zero errors
- [ ] every percentage, dollar/currency figure, multiplier, headcount, and year matches verified owner sources
- [ ] no unverified employer, institution, degree, project, or tool was added

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
