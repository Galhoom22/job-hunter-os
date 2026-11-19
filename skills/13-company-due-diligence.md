---
name: company-due-diligence
version: "1.0.0"
description: Load before submitting a Tier A application or accepting an interview invite to inspect company health, funding/stage signals, layoffs or re-post churn, scam red flags, and Glassdoor/LinkedIn employer trust indicators using Playwright MCP without inventing unverified claims.
triggers:
  - company due diligence
  - check company health before applying
  - Tier A company vetting
  - vet employer for scams or layoffs
requires_mcp:
  - playwright
preconditions:
  - target company name, job URL, and captured job description are available
  - company health check is requested by the owner or triggered for a Tier A role (score >= 8)
requires_skills:
  - discover-and-triage
  - outreach-and-interview-prep
  - log-and-insights
verification:
  - company health badge (GREEN, YELLOW, or RED) is justified solely from observed page/search snapshots with dates
  - red flags (unpaid test work, wire/crypto fees, mismatched domains, mass layoff bursts, chronic reposting) are surfaced transparently
  - summary persisted alongside interview dossier or logged in logs/applications-log.json notes without fabricating ratings
---
# Company Due Diligence & Health Vetting

## When to Use & Preconditions

Protects the owner from ghost startups, scam recruiters, disguised agencies, and distressed employers running unpaid take-home pipelines before time is invested in tailoring or interviewing.

- **Load when:** `company due diligence`; `check company health before applying`; `Tier A company vetting`; `vet employer for scams or layoffs`.
- **Preconditions (stop if any is false):**
  - target company name, job URL, and captured job description are available
  - company health check is requested by the owner or triggered for a Tier A role (`score >= 8`)
- **Requires skills:** `discover-and-triage`, `outreach-and-interview-prep`, `log-and-insights`. **MCP:** `playwright`.

## Deterministic Step-by-Step Execution

1. **Identity & Domain Verification:**
   - Extract the hiring company's legal/brand name, official website domain, and ATS domain from the job posting (`browser_snapshot`).
   - Verify that any recruiter contact email or career link matches the official domain or a verified ATS (`greenhouse.io`, `lever.co`, `ashbyhq.com`, `workday`, `smartrecruiters.com`). Flag free webmail domains (`@gmail.com` for an enterprise claim) or lookalike typos immediately as `RED`.
2. **Ghost & Churn Signal Check:**
   - Inspect job posting age, applicant volume, and whether the exact title has been reposted repeatedly over 30+ days without hiring progression (`discover-and-triage` signals).
   - Check the company's LinkedIn `/jobs/` or `/people/` page (respecting 3–9s pacing) for sudden headcount drops or hiring freezes.
3. **Public Stage, Layoff & Review Signals (Read-Only):**
   - Look up recent public signals via Playwright MCP (company engineering blog, pressroom, Glassdoor/Blind summary if accessible without hitting a login wall or CAPTCHA, or LinkedIn company page).
   - Stop immediately if any source presents a CAPTCHA or bot-wall; mark that source `unverified` rather than bypassing or guessing.
4. **Assign Company Health Badge:**
   - `GREEN`: Active official domain + matching ATS, clear team/product presence, recent engineering or product updates, and zero scam or layoff-crisis indicators.
   - `YELLOW`: Limited public footprint (stealth/early seed), mixed Glassdoor trends, ambiguous contractor-vs-FTE wording, or 21–30 day open role with high applicant count.
   - `RED`: Domain mismatch, upfront payment/hardware-check scam signals, mandatory unpaid production project (>4 hours with commercial IP clause), or active mass-layoff/insolvency report contradicting an aggressive hiring spree.
5. **Emit Report & Persist:**
   - Present a concise 4-line Due Diligence Block in chat (Badge, Funding/Stage observed, Top 2 Strengths, Top Risks / Questions to ask in screening).
   - If Tier A (`>= 8`), attach this block to the role's `interview-dossier.md` (`outreach-and-interview-prep`) and note the badge in `logs/applications-log.json` (`log-and-insights`).

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

- **NEVER** invent Glassdoor scores, funding rounds, revenue numbers, or employee headcounts when a page is gated or unavailable.
- **NEVER** attempt to bypass Cloudflare, login walls, or CAPTCHAs to scrape review sites.
- **NEVER** submit any application without explicit job-specific `APPROVE`, and surface `RED` employer risks prominently so the owner can skip or explicitly confirm proceeding.
- **Self-Verification Check:** Before completing, verify every claim in the Due Diligence Block traces to an observed page snapshot or owner-supplied link, unverified sources are explicitly labeled `unverified`, and the `GREEN`/`YELLOW`/`RED` badge matches the evidence.
