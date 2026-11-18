---
name: ats-keyword-heatmap
version: "1.0.0"
description: Load before exporting any tailored resume PDF to compute and display a deterministic Before vs. After ATS Keyword Match % table across Hard Skills, Tools/Infra, Domain Terms, and Seniority Signals using only verified facts from context/cv.md.
triggers:
  - ATS keyword heatmap
  - before vs after keyword match percentage
  - check resume keyword coverage before PDF export
  - compare JD keywords against tailored CV
requires_mcp:
  - none
preconditions:
  - full expanded job description text is captured
  - base CV (context/cv.md) and draft tailored HTML/bullets are available for comparison
requires_skills:
  - tailor-resume-and-verify
  - discover-and-triage
verification:
  - deterministic 4-row heatmap table (Hard Skills, Tools/Infra, Domain Terms, Seniority Signals) shows exact matched/total counts and Before % vs. After %
  - every newly surfaced keyword in the After column maps to a real verified fact in context/cv.md or context/profile.md
  - missing keywords that the owner does not possess are listed transparently under True Gaps rather than hallucinated into the CV
---
# ATS Keyword Heatmap & Coverage Verifier

## When to Use & Preconditions

Quantifies exactly how much a tailored resume improves ATS keyword coverage over the base CV before printing the final PDF—while proving zero unverified keywords were injected.

- **Load when:** `ATS keyword heatmap`; `before vs after keyword match percentage`; `check resume keyword coverage before PDF export`; `compare JD keywords against tailored CV`.
- **Preconditions (stop if any is false):**
  - full expanded job description text is captured
  - base CV (`context/cv.md`) and draft tailored resume HTML/text are available
- **Requires skills:** `tailor-resume-and-verify`, `discover-and-triage`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **Extract Canonical JD Keyword Inventory (4 Buckets):**
   - Parse the captured job description and group required + preferred terms into four deterministic buckets:
     1. **Hard Skills & Languages:** e.g., `TypeScript`, `Python`, `Go`, `SQL`, `GraphQL`, `System Design`.
     2. **Tools, Frameworks & Infra:** e.g., `React`, `Next.js`, `Node.js`, `PostgreSQL`, `Docker`, `AWS`, `Kubernetes`, `Playwright`.
     3. **Domain & Methodology Terms:** e.g., `Fintech`, `B2B SaaS`, `CI/CD`, `Microservices`, `Observability`, `Event-Driven`, `GDPR`.
     4. **Seniority & Ownership Signals:** e.g., `Architecture`, `Mentoring`, `Cross-Functional`, `SLAs`, `Incident Response`, `Technical Roadmap`.
2. **Score Base CV (`Before %`) vs. Tailored CV (`After %`):**
   - Count exact or canonical-synonym matches present in `context/cv.md` (`Before`) versus the tailored `templates/ats-resume-template.html` draft (`After`).
   - Compute `Matched / Total` and percentage for each bucket and overall weighted coverage.
3. **Verify Every Added Keyword Against the Evidence Map:**
   - For every keyword gained between `Before` and `After` (e.g., surfacing `PostgreSQL` or `CI/CD` from an older role in `context/cv.md` that wasn't prominent in the base summary), cite the exact source employer/project in `context/cv.md`.
   - Separate keywords that do **not** exist in `context/cv.md` or `context/form-answers.yaml` into a **True Unclaimed Gaps** list (for interview prep or user confirmation).
4. **Render the Heatmap Table Before Printing PDF:**
   - Present the concise Markdown table in chat (and optionally inside `interview-dossier.md`):
     `| Category | JD Keywords | Base CV (Before) | Tailored CV (After) | Newly Surfaced (Verified) | True Unclaimed Gaps |`
   - Proceed to PDF export (`skills/03-tailor-resume-and-verify.md`) only when `Unverified Injected Keywords == 0`.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

- **NEVER** inflate `After %` by stuffing unclaimed JD keywords into invisible text, white-on-white fonts, or fabricated bullet points.
- **NEVER** count vague buzzwords (`"team player"`, `"fast-paced"`) as technical ATS keywords.
- **NEVER** hide missing required skills; surface them under **True Unclaimed Gaps** so the owner can confirm if they actually have that experience.
- **Self-Verification Check:** Confirm all 4 category rows (`Hard Skills`, `Tools/Infra`, `Domain Terms`, `Seniority Signals`) show exact `n/N (%)` math, every newly surfaced term traces to `context/cv.md`, and zero unverified keywords appear in the tailored resume.
