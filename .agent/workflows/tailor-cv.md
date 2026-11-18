---
description: Tailor an ATS resume for one job URL with fact-check and humanizer guards (never applies)
---

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Inspect the supplied job URL via Playwright MCP (read-only), verify `context/profile.md`, `context/cv.md`, and `context/resume-data.json`, and follow `skills/03-tailor-resume-and-verify.md`.
3. Enforce the Anti-Hallucination Fact-Check Guard (zero unverified metrics/entities) and Anti-AI Slop filter, save HTML/PDF under `logs/resumes/<company>-<role>-<job-id>/`, and create `interview-dossier.md` (`skills/05-outreach-and-interview-prep.md`). Never click Apply or Submit.
