---
description: Fast-start CV tailoring from one CV and one job description with fact confirmation, ATS keyword comparison, and HTML/TXT output (no browser login or full setup required)
---

# Quick Tailoring Workflow (`/quick-tailor`)

Fast-start path to generate your first **fact-checked, tailored CV** in under 2 minutes — **without** configuring browser login, Playwright MCP, platform targets, or salary/visa preferences.

## Execution Flow

1. **Collect Minimal Inputs:**
   - Ask the user for: (a) their existing CV (pasted in chat or a local file path) and (b) one target job description (pasted text or URL if readable).
   - Do **not** require `context/targets.yaml`, `context/form-answers.yaml`, or Playwright browser login.
2. **Extract Candidate Facts (`skills/01-resume-ingestion.md`):**
   - Extract verified employers, roles, dates, skills, and numeric metrics from the supplied CV.
3. **Mandatory Human Fact Confirmation:**
   - Present the extracted facts concisely and ask the user to confirm or correct them before tailoring.
   - Never assume or invent years of experience, metrics, tools, or titles.
4. **Analyze JD & Match Verified Skills:**
   - Compare JD requirements against the confirmed candidate facts.
   - Separate keywords cleanly into **Verified Matches** and **True Gaps (Explicitly Excluded — Never Claimed)**.
5. **Tailor, Fact-Check & Humanize (`skills/03-tailor-resume-and-verify.md` & `skills/21-ats-keyword-heatmap.md`):**
   - Tailor the CV strictly using confirmed facts (zero fabricated metrics, zero unverified skills, zero AI-slop clichés, zero prose em-dashes).
   - Display:
     - **ATS Keyword Comparison (`Before % -> After %`)**
     - **Evidence Map** (every tailored claim traced back to a confirmed source fact)
     - **True Gaps** explicitly excluded
6. **Generate Portable Local Artifacts (Zero Playwright Required):**
   - Write a clean single-column tailored HTML resume using `templates/ats-resume-template.html` plus a plain-text (`.txt`) copy inside `logs/resumes/quick-tailor-<slug>/`.
   - Offer optional PDF export if Playwright MCP is connected, or instruct the user to print/save as PDF directly from their browser.
   - **Submission Disabled:** Never open or submit employer application forms in `/quick-tailor`. When ready for the full multi-platform pipeline, guide the user to `/setup`.
