---
name: technical-assessment-architect
version: "1.0.0"
description: Load when the owner receives a take-home coding challenge, system design prompt, or technical homework assignment from an employer; produces a clean architecture blueprint, requirement/edge-case matrix, test strategy, and code-review defense Q&A grounded in the owner's stack without generating detectable copy-paste AI slop.
triggers:
  - analyze take-home coding assignment
  - technical assessment architect
  - system design prompt prep
  - review take-home challenge requirements
requires_mcp:
  - none
preconditions:
  - take-home prompt, specification document, or system design problem statement is provided by the owner
  - context/cv.md and context/profile.md are readable so architectural choices match the owner's actual engineering stack and style
requires_skills:
  - outreach-and-interview-prep
  - company-due-diligence
  - meta-self-verification
verification:
  - unpaid commercial-exploitation red flags (>4-6 hours of free production feature work) are checked first via company-due-diligence rules
  - output includes Architecture Blueprint, Hidden Rubric & Edge-Case Checklist, Verification Test Plan, and Live Defense Q&A
  - zero generic AI-slop boilerplate comments or unfamiliar frameworks outside the owner's verified stack are introduced
---
# Technical Assessment & Take-Home Architect

## When to Use & Preconditions

Helps the owner dissect take-home engineering assignments and system-design prompts into a clean architecture plan, evaluator rubric checklist, and live walkthrough defense guide—so the owner writes and defends authentic, high-signal code they understand 100%.

- **Load when:** `analyze take-home coding assignment`; `technical assessment architect`; `system design prompt prep`; `review take-home challenge requirements`.
- **Preconditions (stop if any is false):**
  - take-home prompt or system design problem statement is provided by the owner
  - `context/cv.md` and `context/profile.md` are readable
- **Requires skills:** `outreach-and-interview-prep`, `company-due-diligence`, `meta-self-verification`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **Exploitation & Scope Sanity Check (`company-due-diligence`):**
   - Check the prompt scope first. If the assignment demands building a net-new commercial feature for the employer's live product, requires >8 hours of unpaid work, or demands signing away IP before an initial human screening call, flag a `YELLOW`/`RED` exploitation warning and offer a polite scope-clarification reply draft.
2. **Extract the Evaluator's Hidden Grading Rubric:**
   - Break the prompt into:
     - **Explicit Deliverables:** endpoints, UI states, CLI flags, README instructions, timebox constraint.
     - **Implicit Seniority Signals (What Reviewers Actually Grade):** input validation, idempotency, error boundaries, pagination/rate limits, clean folder structure, deterministic tests, and trade-off documentation.
3. **Draft the Stack-Aligned Architecture Blueprint:**
   - Align libraries, patterns, and project layout strictly with technologies the owner already knows and lists in `context/cv.md` (never suggest an exotic framework the owner cannot defend live).
   - Provide a concise component diagram (ASCII), data model schema, and 4-step implementation milestone plan fitted to a realistic 2–4 hour timebox.
4. **Build the Edge-Case & Test Matrix:**
   - List the top 6–8 edge cases reviewers use to break take-home submissions (empty/malformed payloads, concurrent requests, network failure retries, auth boundary, boundary values, graceful shutdown).
5. **Generate the README Trade-Off Template & Live Defense Q&A:**
   - Save `logs/resumes/<job-slug>/assessment-blueprint.md` containing:
     - A crisp `DECISIONS.md` / `README.md` structure ("What I built", "Key trade-offs under the timebox", "What I would harden for production").
     - **5 Live Code-Review Defense Questions** ("Why did you choose X over Y?", "How does this scale at 10x load?", "Where is the single point of failure?") paired with talking points grounded in the owner's past experience.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

- **NEVER** join or interact with live proctored coding tests, webcam assessments, or timed browser exams (`HackerRank`, `Codility`, `TestGorilla`).
- **NEVER** generate bloated, over-abstracted "AI-slop" code full of robotic comments (`// Here we initialize the variable...`) that the owner cannot explain line-by-line in the follow-up interview.
- **NEVER** recommend tools or languages the owner cannot defend from `context/cv.md`.
- **Self-Verification Check:** Confirm scope/IP red flags were checked, architectural choices match `context/cv.md`, edge-case and test checklists are concrete, and 5 live code-review defense Q&As are included.
