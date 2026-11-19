---
description: Run an instant 15-second offline sandbox simulation using examples/sandbox-demo/ with immediate Mission Control table and full synthetic tailored CV preview (no personal data or browser login)
---

# Instant Sandbox Demo (`/demo`)

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Load `examples/sandbox-demo/demo-profile.md` and `examples/sandbox-demo/sample-jds.md` (do **not** require `context/` or Playwright MCP login for `/demo`).
3. Simulate `skills/02-discover-and-triage.md`, `skills/13-company-due-diligence.md`, `skills/14-privacy-pii-shield.md`, `skills/21-ats-keyword-heatmap.md`, and `skills/03-tailor-resume-and-verify.md`:
   - Filter out `ghost_or_expired` or dealbreaker roles.
   - Score each job `0–10` honestly and assign company health badges (`🟢 Healthy`, `🟡 Caution`, `🔴 Red Flag`).
   - Display the **Mission Control Table** matching `examples/sandbox-demo/expected-mission-control.md`.
4. **Automatic First-Wow Preview (Immediate — Do NOT Wait for `APPLY 1`):**
   - Immediately below the Mission Control Table, present one complete synthetic tailoring demonstration for **Job #1** containing:
     1. **Original Candidate Summary** (from `examples/sandbox-demo/demo-profile.md`)
     2. **Key Job Requirements** (from Job #1)
     3. **Fact-Checked Tailored Resume Summary & Bullets** (zero AI-slop clichés, zero prose em-dashes)
     4. **Verified Facts Used (Evidence Map)**
     5. **Missing Skills Explicitly Excluded (`True Gaps`)**
     6. **ATS Keyword Comparison (`Before % -> After %`)**
     7. **Draft `<= 75`-Word Hiring-Manager Outreach (`DRAFT_ONLY`)**
   - Then invite the user to reply `APPLY <number>` or `APPLY ALL GREEN` to explore tailoring previews for other green/yellow jobs in the table, or run `/quick-tailor` with their own CV.
5. Clearly label all output as **SANDBOX DEMO — zero personal data used, zero live submissions made**.
