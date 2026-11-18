---
description: Run an instant 15-second offline sandbox simulation using examples/sandbox-demo/ without personal data or browser submission
---

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Load `examples/sandbox-demo/demo-profile.md` and `examples/sandbox-demo/sample-jds.md` (do NOT require `context/` or Playwright MCP login for `/demo`).
3. Simulate `skills/02-discover-and-triage.md`, `skills/13-company-due-diligence.md`, `skills/14-privacy-pii-shield.md`, and `skills/03-tailor-resume-and-verify.md`:
   - Filter out any `ghost_or_expired` or dealbreaker roles.
   - Score each job `0–10` honestly and assign company health badges (`🟢 Healthy`, `🟡 Caution`, `🔴 Red Flag`).
   - Display the **Mission Control Table** matching `examples/sandbox-demo/expected-mission-control.md`.
   - Show a PII-shielded, fact-checked, AI-slop-free tailored resume summary + 75-word `outreach-draft` preview for Job 1 if the user replies `APPLY ALL GREEN` or `APPLY 1`.
4. Clearly label all output as **SANDBOX DEMO — zero live submissions made**.
