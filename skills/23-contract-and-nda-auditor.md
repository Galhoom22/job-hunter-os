---
name: contract-and-nda-auditor
version: "1.0.0"
description: Load when the owner receives an employment contract, offer letter, B2B Independent Contractor Agreement (MSA/SOW), or NDA; audits clauses for IP overreach, non-compete traps, unilateral termination, and net-60/90 payment delays, and drafts polite counter-clause proposals (educational analysis only, not formal legal representation).
triggers:
  - audit employment contract or NDA
  - review B2B contractor agreement or MSA
  - check offer contract for red flags
  - contract and NDA auditor
requires_mcp:
  - none
preconditions:
  - contract, offer letter, MSA/SOW, or NDA text is provided by the owner in chat or local file
  - context/preferences.yaml and context/form-answers.yaml are readable to cross-check agreed compensation, notice period, and work mode
requires_skills:
  - offer-negotiator
  - privacy-pii-shield
verification:
  - includes explicit educational-review disclaimer (not a substitute for licensed legal counsel in the owner's jurisdiction)
  - audits all 6 core clause categories (Compensation/Payment Terms, IP Assignment & Prior Inventions, Non-Compete/Non-Solicit, Termination & Notice, Liability/Indemnification, Remote/Tax Classification)
  - every flagged YELLOW/RED clause includes an exact quote from the document and a polite DRAFT_ONLY redline/counter-proposal
---
# Employment Contract, B2B MSA & NDA Clause Auditor

## When to Use & Preconditions

Inspects incoming employment contracts, B2B Master Services Agreements (MSAs), Statements of Work (SOWs), and NDAs against the owner's agreed terms and industry norms—highlighting risky clauses and drafting calm, constructive redline requests.

> **Disclaimer:** This skill provides structured commercial and engineering-contract analysis, **not** formal legal representation. Always recommend consulting a licensed employment/contract attorney in the relevant jurisdiction before signing binding agreements.

- **Load when:** `audit employment contract or NDA`; `review B2B contractor agreement or MSA`; `check offer contract for red flags`; `contract and NDA auditor`.
- **Preconditions (stop if any is false):**
  - contract, offer letter, MSA/SOW, or NDA text is provided by the owner
  - `context/preferences.yaml` and `context/form-answers.yaml` are readable
- **Requires skills:** `offer-negotiator`, `privacy-pii-shield`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **Cross-Check Commercial Headline Terms Against Agreed Offer:**
   - Compare base salary / hourly or monthly B2B rate, currency, bonus/equity vesting schedule, start date, and remote/hybrid location wording in the contract against the verbal/email offer and `context/preferences.yaml`. Flag any discrepancy immediately.
2. **Audit the 6 High-Risk Engineering Clause Categories:**
   - Quote exact clause numbers/sentences and rate each `GREEN` (standard), `YELLOW` (ambiguous / worth clarifying), or `RED` (aggressive / dangerous):
     1. **IP Assignment & Prior Inventions:** Does the clause claim ownership over open-source, side projects, or tools built *off-hours on personal equipment*? Ensure a **Prior Inventions Exhibit** carve-out exists.
     2. **Non-Compete & Non-Solicitation:** Check duration (`> 6–12 months`) and geographic/industry breadth (`"any company building software or AI"` is overbroad and blocks future livelihood).
     3. **Payment Terms & Late Fees (B2B / Freelance):** Flag `Net-60` or `Net-90` invoice windows, `"pay-when-paid"` agency clauses (client non-payment shifts risk to the engineer), or missing invoice dispute windows; recommend `Net-15` or `Net-30`.
     4. **Termination, Notice & Clawbacks:** Check whether notice periods are symmetrical (e.g., employer can terminate with 0 days notice while contractor must give 30 days) or if signing/relocation bonuses have harsh gross-amount clawbacks.
     5. **Indemnification & Liability Cap (B2B):** Flag uncapped personal liability; standard B2B engineering contracts cap liability at **1x–3x fees paid in the preceding 3–6 months**.
     6. **Equipment, Expense & Tax Classification:** Verify contractor autonomy language (avoiding disguised-employment pitfalls without FTE benefits).
3. **Draft Polite Redline & Counter-Clause Requests (`DRAFT_ONLY`):**
   - For every `YELLOW` or `RED` clause, provide:
     - **Plain-English Risk:** 1 sentence explaining the practical downside.
     - **Suggested Redline Wording:** narrow, standard industry language (e.g., limiting IP assignment to work performed using company resources or related to company business).
     - **Polite Email Note to HR / Legal (`DRAFT_ONLY`):** collaborative, non-adversarial phrasing requesting the adjustment.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

- **NEVER** present analysis as licensed legal advice or instruct the owner to sign a contract containing `RED` clauses without review.
- **NEVER** invent clause numbers or quote contract text that does not appear in the supplied document.
- **NEVER** auto-send redline emails or sign/click e-signature portals (`DocuSign`, `HelloSign`, `Deel`) on behalf of the owner.
- **Self-Verification Check:** Confirm the educational disclaimer is shown, all 6 clause categories were checked against exact document quotes, commercial numbers match `context/preferences.yaml`, and counter-proposals are marked `DRAFT_ONLY`.
