# Interview Prep & Archived JD Dossier (Sample Output)

- **Company:** CloudScale Payments
- **Role:** Senior Full-Stack & AI Engineer
- **job_id:** `greenhouse:cloudscale-4012`
- **Canonical URL:** `https://boards.greenhouse.io/cloudscale/jobs/4012`
- **Status:** `applied` (`2026-11-18T11:20:00Z`) · **Match Score:** `9.2 / 10` · **Health:** `🟢 Healthy`
- **Resume Sent:** `logs/resumes/cloudscale-senior-fullstack-ai-greenhouse-4012/resume.pdf`

---

## 1. Archived Full Job Description
> We are looking for a Senior Full-Stack & AI Engineer to build reliable TypeScript/Node.js backend services, React developer consoles, and MCP-powered internal agent workflows. Must have 4+ years with TypeScript, React, Node.js, and PostgreSQL, plus hands-on experience building browser automation or LLM tool-calling pipelines. Automated testing with Playwright and CI/CD ownership are core to the role.

---

## 2. Tailored CV Emphasis & Evidence Map
- **Foregrounded Work:**
  - NilePay Sandbox: TypeScript/Node.js webhook settlement services (180k daily events) with PostgreSQL idempotency keys.
  - NilePay Sandbox: Checkout API p95 latency reduction (`420ms -> 165ms`) via batched SQL joins and Redis caching.
  - NilePay Sandbox: Playwright end-to-end suite (45 flows) in GitHub Actions.
  - Project: **AgentEval MCP** (Markdown evaluation harness for Playwright MCP tool calling).
- **Skill Gaps (Not Claimed):** None on core requirements.

---

## 3. Top 5 Likely Technical & Behavioral Interview Questions
1. **PostgreSQL Idempotency at Scale:** Walk through how you structured idempotency keys for 180k daily webhook events at NilePay and how you handled concurrent duplicate retries.
   - *Grounded cue:* Reference exact transaction/unique-constraint handling you implemented; avoid guessing unverified throughput ceilings.
2. **Latency Debugging (`420ms -> 165ms`):** How did you profile the N+1 checkout bottleneck before choosing batched SQL joins and Redis caching, and how did you prevent cache staleness?
3. **MCP Tool-Calling Reliability:** Based on **AgentEval MCP**, how do you keep browser-driving LLM agents deterministic when page DOMs shift or modal transitions invalidate element refs?
4. **Playwright CI Flakiness:** How did you keep 45 merchant onboarding E2E tests fast and non-flaky inside GitHub Actions?
5. **Cross-Stack Ownership:** Tell us about a time a backend schema migration affected the React tenant console in DeltaCloud and how you rolled it out without tenant downtime.
