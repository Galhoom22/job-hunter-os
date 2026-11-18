---
name: interview-dossier
version: "1.0.0"
description: Load when a job application is prepared (Tier A / tailor-resume) or submitted; archives the full job description, tailored resume emphasis, and top 5 interview prep questions into interview-dossier.md before the posting disappears.
triggers:
  - application prepared or submitted
  - post-application interview prep
  - archive job description for interview
requires_mcp:
  - none
preconditions:
  - full expanded job description captured from the live posting
  - per-job folder logs/resumes/<folder>/ exists with tailoring-notes.md
requires_skills:
  - tailor-resume
verification:
  - interview-dossier.md exists in logs/resumes/<folder>/ with all three required sections
  - archived JD text is complete and unmodified from the observed posting
  - all 5 prep questions and talking points reference only verified owner projects/skills and observed JD gaps
---
# Post-Application Interview Prep & Archived JD Dossier

## When to Use & Preconditions

Job postings frequently go offline weeks before an interview call. Create this dossier whenever an application is prepared or submitted so the owner always keeps the exact JD and tailored prep notes.

- **Load when:** application prepared or submitted; post-application interview prep; archive job description for interview.
- **Preconditions (stop if any is false):**
  - full expanded job description captured from the live posting
  - per-job folder `logs/resumes/<folder>/` exists with `tailoring-notes.md`
- **Requires skills:** `tailor-resume`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **Resolve the job's artifact folder:**
   - Use the exact per-job directory under `logs/resumes/<company>-<role>-<job-id>/`.
2. **Write `interview-dossier.md` with four deterministic sections:**
   - **Header metadata:** Company, Role, `job_id`, canonical job URL, ATS hostname, status (`prepared` / `dry_run` / `applied`), timestamp, match score, and path to `resume.pdf`.
   - **Section 1 — Archived Full Job Description:**
     - Paste the complete, verbatim expanded Job Description text observed during discovery (including responsibilities, requirements, compensation/location notes, and benefits) so nothing is lost if the employer takes the posting down.
   - **Section 2 — Tailored CV Emphasis & Evidence Map:**
     - Summarize which verified projects, employers, skills order, and bullets were foregrounded in the tailored `resume.pdf` sent to this employer (matching `tailoring-notes.md` and `payload.json`), plus explicit skill gaps identified during scoring.
   - **Section 3 — Top 5 Likely Technical & Behavioral Interview Questions:**
     - Generate 5 specific questions rooted in the overlap and gaps between `context/profile.md` / `context/resume-data.json` and the archived JD (e.g., 3 technical/architecture questions probing JD-critical requirements or missing/adjacent skills, and 2 behavioral/project deep-dive questions tied to foregrounded bullets).
     - Include brief, honest talking-point cues referencing **only verified projects and facts** from `context/profile.md` (and note honest framing for any gap without inventing experience).
3. **Keep private & log the path:**
   - Keep `interview-dossier.md` inside `logs/resumes/` (gitignored). Mention its path in the run/application summary or `notes`.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Summarizing the JD in 3 lines instead of archiving the full text → ✅ save the complete verbatim JD so deleted postings remain searchable.
- ❌ Writing generic trivia questions unrelated to the JD or gaps → ✅ tie every question to real JD requirements and gaps vs `context/profile.md`.
- ❌ Inventing talking points or metrics the owner never achieved → ✅ ground every prep cue in verified CV facts.

### Self-verification check (before reporting this step complete)
- [ ] `interview-dossier.md` exists in `logs/resumes/<folder>/` with all three required sections
- [ ] archived JD text is complete and unmodified from the observed posting
- [ ] all 5 prep questions and talking points reference only verified owner projects/skills and observed JD gaps

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
