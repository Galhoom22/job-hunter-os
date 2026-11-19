---
name: quick-tailor
description: Load when the owner wants fast-start CV tailoring (/quick-tailor) from one real CV and one job description with human fact confirmation, ATS keyword comparison, and HTML/TXT output (no browser login or full setup required).
---

# Quick CV Tailoring Workflow (`/quick-tailor`)

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Follow `.agent/workflows/quick-tailor.md`: collect only the owner's CV and one target job description without requiring browser login, Playwright MCP, or full 5-gate setup.
3. Extract and confirm facts (`skills/01-resume-ingestion.md`), generate and re-read-verify `resume.html`, Word-compatible `resume.doc` (never fake `.docx`), `resume.txt`, `tailoring-notes.md` (Evidence Map, ATS Keyword Comparison via `skills/21-ats-keyword-heatmap.md`, True Gaps), and optional `resume.pdf` (or Print-to-PDF guidance) under `logs/resumes/quick-tailor-<slug>/`. Support iterative edits without restarting; never fabricate claims or submit forms.
