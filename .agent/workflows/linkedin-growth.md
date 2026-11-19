---
description: Run LinkedIn profile review, CV consistency check, 0-100 Recruiter-SEO audit, grounded rewrites, posts, or <=75-word outreach (DRAFT_ONLY default; explicit APPROVE + snapshot verification for live edits)
---

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Follow `skills/linkedin-growth.md` (profile inspection from pasted/PDF/screenshot or signed-in Playwright, CV consistency audit, `0–100` Recruiter-SEO scorecard, grounded Before/After rewrites) and `skills/05-outreach-and-interview-prep.md` (with Anti-AI Slop + Fact-Check Guard from `skills/03-tailor-resume-and-verify.md`).
3. **`DRAFT_ONLY` Default & `APPROVE` Gate:** Output `DRAFT_ONLY` copy in chat and `logs/insights/`, verify `<= 75`-word outreach via `node ./bin/cli.mjs pre-submit`, and never click Save/Post/Send unless legitimate signed-in Playwright access exists AND the owner explicitly replies `APPROVE` on the exact final diff (then re-verify persisted state via fresh `browser_snapshot`).
