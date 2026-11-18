---
name: persona-switcher
version: "1.0.0"
description: Load when the owner maintains multiple target tracks (e.g., Fullstack Engineer, AI Agent Engineer, B2B Contractor) in context/personas/ and asks to switch active persona, CV focus, target roles, or rate floors in chat.
triggers:
  - switch persona to <name>
  - list personas
  - create new persona
requires_mcp:
  - none
preconditions:
  - base owner-verified facts exist in context/profile.md and context/cv.md
  - persona definitions live under context/personas/ (private, gitignored)
requires_skills:
  - interrogate-and-onboard
verification:
  - active persona name, target roles, rate floor, and CV emphasis match an owner-confirmed file under context/personas/
  - no unverified skills, employers, or inflated years were introduced when switching personas
  - context/preferences.yaml (or active session briefing) reflects the selected persona before discovery begins
---
# Multi-Persona Career Switcher

## When to Use & Preconditions

Use when a candidate applies across distinct tracks (for example: **Fullstack Engineer**, **AI Agent Engineer**, or **B2B Remote Contractor**) and needs tailored target roles, rate floors, and CV emphasis without overwriting their base facts.

- **Load when:** `switch persona to <name>`; `list personas`; `create new persona`.
- **Preconditions (stop if any is false):**
  - base owner-verified facts exist in `context/profile.md` and `context/cv.md`
  - persona definitions live under `context/personas/` (private, gitignored)
- **Requires skills:** `interrogate-and-onboard`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **Discover or initialize `context/personas/`:**
   - Check `context/personas/*.md` (e.g., `fullstack-engineer.md`, `ai-agent-engineer.md`, `b2b-contractor.md`).
   - If the owner asks to create a new persona, interview them in 3–4 questions for:
     - Target role titles & seniority for this track
     - Core verified skills to foreground (must exist in `context/cv.md` / `context/form-answers.yaml`)
     - Compensation / B2B rate floor (hourly/monthly/annual + currency) and work-mode/region rules
     - Voice/positioning summary (grounded strictly in verified projects)
   - Save the confirmed persona file to `context/personas/<slug>.md` (keep inside `context/` so `.gitignore` protects it).
2. **Switch active persona in chat:**
   - Read the selected `context/personas/<slug>.md` file.
   - Cross-check every skill, title, and metric against `context/profile.md` and `context/cv.md` (never invent new tenure or unverified tools for a persona).
   - Update active session targeting (`roles`, `seniority`, `salary`/`rate_floor`, and `active_persona: "<slug>"` in `context/preferences.yaml` only with owner confirmation) and echo a concise Mission Briefing confirmation before discovery (`skills/02-discover-and-triage.md`) or tailoring (`skills/03-tailor-resume-and-verify.md`).
3. **Preserve persona boundaries during runs:**
   - Tag tailored resume folders or `notes` with the active persona slug so later `/weekly-report` and `skills/08-follow-up-radar.md` know which positioning was sent.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Inventing `"3 years of LangGraph"` inside an `ai-agent-engineer.md` persona when `context/form-answers.yaml` lists `0` → ✅ every persona draws strictly from verified owner facts.
- ❌ Switching personas mid-run without updating the Mission Briefing and confirming caps/rate floors → ✅ confirm the new persona summary with the owner first.
- ❌ Saving personal persona files outside `context/` where Git could commit them → ✅ always store under `context/personas/`.

### Self-verification check (before reporting this step complete)
- [ ] active persona name, target roles, rate floor, and CV emphasis match an owner-confirmed file under `context/personas/`
- [ ] no unverified skills, employers, or inflated years were introduced when switching personas
- [ ] `context/preferences.yaml` (or active session briefing) reflects the selected persona before discovery begins
