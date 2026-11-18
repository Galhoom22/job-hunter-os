---
name: humanize-writing
version: "1.0.0"
description: Load when writing or editing any tailored resume summary, cover letter, outreach note, email draft, or open-ended application answer; strips LLM clichés and em-dash overuse to enforce a crisp peer-engineer tone.
triggers:
  - drafting tailored summary or bullets
  - drafting cover letter or outreach note
  - drafting free-text application answer
requires_mcp:
  - none
preconditions:
  - factual claims already verified against context/profile.md and context/resume-data.json
requires_skills:
  - fact-check-guard
verification:
  - zero banned AI-slop phrases appear in the final text
  - em-dashes (—) are eliminated in prose (0 in short answers/outreach, at most 1 in longer letters)
  - text uses concrete technical nouns, active verbs, and matches the owner's voice
---
# Anti-AI Slop & Humanizer Filter

## When to Use & Preconditions

Mandatory writing pass before saving or displaying any generated prose (tailored summaries, cover letters, `outreach-draft.md`, `email-draft.md`, and motivation answers).

- **Load when:** drafting tailored summary or bullets; drafting cover letter or outreach note; drafting free-text application answer.
- **Preconditions (stop if any is false):**
  - factual claims already verified against `context/profile.md` and `context/resume-data.json`
- **Requires skills:** `fact-check-guard`. **MCP:** none.

## Deterministic Step-by-Step Execution

1. **Scan and remove banned AI-slop words and phrases (case-insensitive):**
   - Strictly banned:
     - `delve`, `testament`, `tapestry`, `spearheaded`, `synergy`, `thrilled to apply`, `fast-paced environment`, `moreover`, `furthermore`
     - `leveraged`, `orchestrated`, `passionate about`, `dynamic environment`, `proven track record`, `hit the ground running`, `deeply excited`
2. **Eliminate em-dash overuse (`—`):**
   - In short form answers, resume summaries, outreach notes, and emails: **0 em-dashes** in prose. Use periods, commas, or parentheses instead.
   - Structural headings like `Senior Engineer — Acme` in rendered templates are allowed; prose sentences must not rely on `—` cadence.
3. **Rewrite in a crisp peer-engineer tone:**
   - Replace vague filler with concrete technical nouns and active plain verbs (`built`, `shipped`, `reduced`, `migrated`, `tested`, `debugged`, `maintained`).
   - Keep sentences direct (12–22 words average). One clear claim per sentence.
   - Match the owner's configured `voice` in `context/profile.md` (default: clear, practical, zero buzzwords).
4. **Verify with CLI slop check:**
   - When auditing tailored resumes or cover letters, run:
     ```bash
     node bin/job-hunter.mjs verify-cv <tailored-file> --strict-humanize
     ```
     and rewrite any flagged phrase before proceeding.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ `"I am thrilled to apply and leverage my proven track record in a fast-paced environment — moreover, I spearheaded..."` → ✅ `"I build TypeScript payment APIs and automated test suites, and your backend team's checkout reliability work fits what I have shipped for the past three years."`
- ❌ Replacing a real technical verb (`migrated`) with buzzword fluff (`orchestrated a tapestry of`) → ✅ prefer plain engineering verbs.
- ❌ Using `—` in every second sentence → ✅ split into clean sentences with periods or commas.

### Self-verification check (before reporting this step complete)
- [ ] zero banned AI-slop phrases appear in the final text
- [ ] em-dashes (`—`) are eliminated in prose (0 in short answers/outreach, at most 1 in longer letters)
- [ ] text uses concrete technical nouns, active verbs, and matches the owner's voice

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
