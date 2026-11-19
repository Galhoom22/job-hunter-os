---
name: linkedin-growth
description: Load when the owner explicitly asks to audit their LinkedIn profile (0-100 Recruiter-SEO rubric), optimize profile copy, draft a post, or draft <=75-word outreach (/linkedin-growth) — strictly Read-Only Audit + Chat Draft Output Only (DRAFT_ONLY, zero browser mutations).
---

# Job Hunter LinkedIn Growth

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Load `skills/linkedin-growth.md` for the `0–100` Recruiter-SEO Profile Audit & Grounded Copy Optimizer (plus `skills/05-outreach-and-interview-prep.md` for hiring-manager outreach and `skills/03-tailor-resume-and-verify.md` for Anti-Hallucination & Anti-AI Slop rules).
3. **Zero Browser-Mutation Lock:** Never click LinkedIn profile `"Edit"`, `"Save"`, `"Post"`, or `"Send"` buttons via Playwright. Output strictly `DRAFT_ONLY` copy in chat (and `logs/insights/`) and verify `<= 75`-word outreach via `node ./bin/cli.mjs pre-submit`.
