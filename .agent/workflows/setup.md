---
description: Audit readiness, ingest CV, interview in batches of 3-4 questions, and verify Playwright MCP login
---

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Follow `skills/00-interrogate-and-onboard.md` and `skills/01-resume-ingestion.md` directly using your file tools and Playwright MCP.
3. Extract only verified owner facts into `context/profile.md`, `context/cv.md`, `context/resume-data.json`, `context/preferences.yaml`, `context/form-answers.yaml`, and `context/targets.yaml`. Never invent facts or copy `.example` values.
4. Open Playwright MCP in headed mode (`./browser-profile`) so the owner can log in privately. Setup never submits applications.
