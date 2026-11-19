---
description: Score, tailor, and safely process one owner-supplied HTTPS job URL (with manual-prep fallback if Playwright or ATS automation is unavailable)
---

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Check `skills/00-interrogate-and-onboard.md` (5 readiness gates + fresh launch consent). Ask concisely in small batches for any missing profile/CV/legal facts instead of stalling.
3. **If Playwright MCP is connected and browser login is ready:** verify auth on the target platform (or open the public ATS URL directly), load `context/` + `config/guardrails.yaml`, and process ONLY the supplied HTTPS URL via `skills/02-discover-and-triage.md`, `skills/03-tailor-resume-and-verify.md`, `skills/04-fill-and-apply.md` (upload-first + Live DOM Read-Back Table + explicit job-specific `APPROVE`), `skills/05-outreach-and-interview-prep.md`, and `skills/06-log-and-insights.md`.
4. **Practical Fallback (No Playwright MCP, Workday/Taleo, Account Gate, or Blocked Upload):** Never leave the user empty-handed — ask for the pasted JD if needed, tailor and verify `resume.html`/`resume.txt`/`resume.doc` (plus `resume.pdf` or print instructions), prepare `interview-dossier.md` + ready-to-paste form answers (`skills/fallback-no-mcp.md`), and hand off cleanly for manual submission.
