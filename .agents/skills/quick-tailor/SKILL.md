---
name: quick-tailor
description: Load when the owner wants fast-start CV tailoring (/quick-tailor) from one real CV and one job description with human fact confirmation, ATS keyword comparison, and HTML/TXT output (no browser login or full setup required).
---

# Quick CV Tailoring Workflow (`/quick-tailor`)

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Follow `.agent/workflows/quick-tailor.md`: collect only the owner's CV and one target job description without requiring browser login, Playwright MCP, or full 5-gate setup.
3. Extract facts (`skills/01-resume-ingestion.md`), confirm them explicitly with the owner, then produce a fact-checked tailored single-column HTML + TXT resume (`skills/03-tailor-resume-and-verify.md`), ATS Keyword Comparison (`skills/21-ats-keyword-heatmap.md`), Evidence Map, and explicit **True Gaps** under `logs/resumes/quick-tailor-<slug>/`. Never fabricate claims or submit forms.
