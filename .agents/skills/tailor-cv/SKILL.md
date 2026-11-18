---
name: tailor-cv
description: Load when the owner wants to tailor an ATS resume and cover letter for a specific job URL (/tailor-cv) with zero hallucinated metrics or AI-slop clichés (never submits).
---

# Job Hunter Tailor CV

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Inspect the supplied job URL via Playwright MCP and execute `skills/03-tailor-resume-and-verify.md` (fact-check guard + anti-AI slop filter + `.pdf`/`.doc`/`.txt` artifacts under `logs/resumes/`).
3. Archive the JD and prep questions via `skills/05-outreach-and-interview-prep.md` (`interview-dossier.md`). Never apply or submit.
