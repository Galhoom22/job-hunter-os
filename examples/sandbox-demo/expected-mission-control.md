# Expected `/demo` Sandbox Output — Mission Control Table

Running `/demo` evaluates [`sample-jds.md`](sample-jds.md) against [`demo-profile.md`](demo-profile.md) using PII masking (`skills/14-privacy-pii-shield.md`), company due diligence (`skills/13-company-due-diligence.md`), ghost detection (`skills/02-discover-and-triage.md`), fact-checking, and anti-AI slop rules (`skills/03-tailor-resume-and-verify.md`):

## Mission Control Briefing

| # | Company & Role | Health | Score | Status | What Changed in Tailored CV (or Why Skipped) | Tailored Artifacts |
|---|---|---|---|---|---|---|
| 1 | CloudScale Payments — Senior Full-Stack & AI Engineer | 🟢 Healthy | 9.2 | 🟢 Ready | Foregrounded TypeScript/Node.js webhook services (180k daily events), PostgreSQL p95 latency reduction (420ms -> 165ms), Playwright CI, and AgentEval MCP; PII masked (`{{CANDIDATE_PHONE}}`) during drafting | `logs/resumes/cloudscale-senior-fullstack-ai-greenhouse-4012/` |
| 2 | OrbitMesh Labs — Senior Platform & AI Infrastructure Engineer | 🟡 Caution | 6.6 | 🟡 Stretch | Foregrounded Docker, GitHub Actions CI, Python/FastAPI, and latency optimization. **Gaps (not claimed):** Kubernetes (EKS), Terraform | — (prepares on request) |
| 3 | LegacyMobile Corp — Principal Native iOS & Swift Engineer | 🔴 Red Flag | 1.5 | 🔴 Skipped | `ghost_or_expired`: Posted 47 days ago (`> 30d`), closed on employer ATS, recent layoff signal, Swift-only stack + SF onsite/no visa | Logged to `logs/skipped-jobs.json` |

### Agent Prompt in Chat
> I scanned **3 sandbox jobs**: **1** is 🟢 Ready (with fact-checked, AI-slop-free resume & `interview-dossier.md` + `<= 75`-word `outreach-draft.md`), **1** is 🟡 Stretch, and **1** was 🔴 Skipped (`ghost_or_expired` + dealbreaker).
>
> *(Sandbox Mode — no real browser submission will occur.)* Reply `APPLY ALL GREEN`, `APPLY 1`, or tell me which CV to inspect or tweak.
