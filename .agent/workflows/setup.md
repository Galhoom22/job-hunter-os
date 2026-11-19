---
description: Audit readiness, ingest CV, interview in batches of 3-4 questions, and verify Playwright MCP login
---

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Follow `skills/00-interrogate-and-onboard.md` and `skills/01-resume-ingestion.md` using IDE file tools (Playwright MCP is optional for Gates 1–4 and needed only for Step 4 browser login or PDF printing). Note: standalone CV, tailoring, LinkedIn, interview-prep, offer/contract, and reporting tasks do not require `/setup`.
3. Extract only verified owner facts into `context/profile.md`, `context/cv.md`, `context/resume-data.json`, `context/preferences.yaml`, `context/form-answers.yaml`, and `context/targets.yaml`. Never invent facts or copy `.example` values.
4. When Playwright MCP is available and browser discovery/applying is desired, open Playwright MCP in headed mode (`./browser-profile`) so the owner can log in privately (otherwise complete local Gates 1–4 cleanly and report browser setup as pending). Setup never submits applications.
