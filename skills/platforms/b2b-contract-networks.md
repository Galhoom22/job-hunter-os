---
name: b2b-contract-networks
version: "1.0.0"
description: Load when discovering or applying to curated B2B & remote freelance engineering networks (Toptal, Braintrust, Lemon.io, Gun.io, Contra, Arc.dev, Turing); handles vetted-talent gate detection, rate-card consistency, contract pitch drafting, and strict human approval before any profile update or application submission.
triggers:
  - target.platform in toptal/braintrust/lemon/gunio/contra/arc/turing
  - B2B contract network search
  - curated freelance engineering platform
requires_mcp:
  - playwright
preconditions:
  - readiness gates passed, auth verified via Playwright MCP, and context loaded
  - B2B or contract work_type and verified rate floor configured in context/preferences.yaml
requires_skills:
  - discover-and-triage
  - offer-negotiator
  - fill-and-apply
verification:
  - verified whether the target requires talent-network vetting/login before accessing client gigs
  - proposed hourly/monthly rate aligns strictly with context/preferences.yaml floor without undercutting
  - draft-only pitch and explicit APPROVE gate enforced before any submission or public profile edit
---
# B2B & Remote Contract Networks Playbook

## When to Use & Preconditions

Covers curated B2B engineering networks and fractional/contract talent marketplaces: **Toptal**, **Braintrust**, **Lemon.io**, **Gun.io**, **Contra**, **Arc.dev**, and **Turing**.

- **Load when:** `target.platform in toptal/braintrust/lemon/gunio/contra/arc/turing`; `B2B contract network search`; `curated freelance engineering platform`.
- **Preconditions (stop if any is false):**
  - readiness gates passed, auth verified via Playwright MCP, and context loaded
  - B2B or contract `work_type` and verified rate floor configured in `context/preferences.yaml`
- **Requires skills:** `discover-and-triage`, `offer-negotiator`, `fill-and-apply`. **MCP:** `playwright`.

## Deterministic Step-by-Step Execution

1. **Check Network Mode (Open Gig Feed vs. Vetted Talent Portal):**
   - Open the enabled network URL via Playwright MCP and inspect `browser_snapshot` after a random **3–9 second** pause.
   - Distinguish between:
     - **Client Project Feed (already vetted member):** browse live client contracts, check timezone overlap (`EST`/`CET`), contract length, and weekly hour commitment (`20h`/`40h`).
     - **Talent Onboarding / Vetting Gate:** many curated networks (`Toptal`, `Lemon.io`, `Gun.io`, `Turing`) require passing an English screening, technical assessment, or live coding interview before seeing private client jobs. **Never fake assessments or bypass screening gates** — pause and notify the owner in chat.
2. **Rate Card & Currency Grounding:**
   - Compare posted budget or platform fee structure (e.g., Braintrust 0% talent fee vs. agency-margin networks) against the owner's minimum B2B hourly/monthly rate in `context/preferences.yaml` and `context/form-answers.yaml`.
   - Load `skills/09-offer-negotiator.md` whenever a network asks for an explicit hourly rate bid to ensure consistent net-take-home math.
3. **Contract Pitch & Scope Triage:**
   - Score active client projects using the 0–10 rubric (`skills/02-discover-and-triage.md`), weighting stack overlap, timezone overlap, and verified contract duration.
   - Draft concise `<= 75`-word project pitches referencing only real portfolio/production proof from `context/cv.md` and `context/profile.md`.
4. **Pause for Approval Before Any Submit or Profile Change:**
   - Display exact proposed rate, hours/week availability, and pitch text in chat. Wait for explicit job-bound `APPROVE` (or `approve`) before submitting any proposal or saving public freelancer profile updates.
5. **Log Disposition:**
   - Record submitted proposals (`applied`), gated onboarding walls (`needs_review`), or mismatched budgets (`skipped`) in `logs/applications-log.json` or `logs/skipped-jobs.json`.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

- **NEVER** auto-take coding assessments, automated video interviews, or AI screening bots on behalf of the owner.
- **NEVER** quote a rate below the verified B2B floor in `context/preferences.yaml` to win a bid.
- **NEVER** edit a public Contra/Braintrust/Arc portfolio or submit a client proposal without showing exact text and receiving explicit owner approval.
- **Self-Verification Check:** Before completing, verify auth/vetting status was checked honestly from `browser_snapshot`, quoted rates match `context/preferences.yaml`, and every submission/skip has an exact `logs/` entry.
