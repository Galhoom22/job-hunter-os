# Chat Commands & IDE Portability

All slash commands below are executed directly by the AI model inside your IDE or CLI harness (accompanied by a lightweight zero-dependency Node.js CLI in `bin/cli.mjs` for offline audit, proof generation, pre-submit cap/word checks, and IDE setup). Read `AGENTS.md` and `skills/REGISTRY.md` first.

| Alias | Fast-Start / Scope | Fallback Chat Prompt | Workflow | Primary Skill(s) |
|---|---|---|---|---|
| `/demo` | **No CV / No Browser Login** | Run the synthetic sandbox demo with immediate Job #1 tailored preview | [demo](../.agent/workflows/demo.md) | [02-discover-and-triage](../skills/02-discover-and-triage.md), [03-tailor-resume-and-verify](../skills/03-tailor-resume-and-verify.md) |
| `/quick-tailor` | **1 CV + 1 JD / No Browser Login** | Tailor my CV for this one job description with fact confirmation | [quick-tailor](../.agent/workflows/quick-tailor.md) | [01-resume-ingestion](../skills/01-resume-ingestion.md), [03-tailor-resume-and-verify](../skills/03-tailor-resume-and-verify.md), [21-ats-keyword-heatmap](../skills/21-ats-keyword-heatmap.md) |
| `/setup` | Full Career OS (optional browser login) | Setup my profile from this CV and help me log in | [setup](../.agent/workflows/setup.md) | [00-interrogate-and-onboard](../skills/00-interrogate-and-onboard.md), [01-resume-ingestion](../skills/01-resume-ingestion.md) |
| `/daily-run` | Full Career OS (`dry_run: true` default) | Run today's job discovery, CV tailoring, and gated applications | [daily-run](../.agent/workflows/daily-run.md) | [00-daily-run](../skills/00-daily-run.md) |
| `/tailor-cv` | Single URL (never submits) | Tailor my CV for this job URL; do not apply | [tailor-cv](../.agent/workflows/tailor-cv.md) | [03-tailor-resume-and-verify](../skills/03-tailor-resume-and-verify.md) |
| `/apply-url` | Single URL (`APPROVE`-gated) | Score, tailor, and safely process this one job URL | [apply-url](../.agent/workflows/apply-url.md) | [00-daily-run](../skills/00-daily-run.md) |
| `/weekly-report` | Local logs only (no MCP needed) | Generate my weekly market and skill-gap report | [weekly-report](../.agent/workflows/weekly-report.md) | [06-log-and-insights](../skills/06-log-and-insights.md) |
| `/linkedin-growth` | Read-only audit + `DRAFT_ONLY` | Audit my LinkedIn profile (`0-100`) or draft copy/outreach (`DRAFT_ONLY`) | [linkedin-growth](../.agent/workflows/linkedin-growth.md) | [linkedin-growth](../skills/linkedin-growth.md), [05-outreach-and-interview-prep](../skills/05-outreach-and-interview-prep.md) |

| IDE / Harness | Canonical Instruction Entry | Workflow / Command Discovery |
|---|---|---|
| Antigravity | `AGENTS.md` + `skills/REGISTRY.md` | `.agent/workflows/` (or `~/.gemini/antigravity/global_workflows/`) |
| Cursor | `.cursor/rules/job-hunter.mdc` | `.agents/skills/` + `.agent/workflows/<command>.md` |
| Claude Code | `CLAUDE.md` | `commands/*.md` + `.agents/skills/` (global: `~/.claude/commands/` + `~/.claude/skills/`) |
| Codex / OpenCode / Zed / Goose | `AGENTS.md` | `.agents/skills/*/SKILL.md` (global: `~/.agents/skills/`) |
| Windsurf / Devin Desktop | `.windsurfrules` | `.agent/workflows/` (global: `~/.windsurf/workflows/`) |
| Cline / Roo | `.clinerules` / `.roo/rules/job-hunter.md` | Chat prompt + optional MCP settings |
| GitHub Copilot | `.github/copilot-instructions.md` | `.github/prompts/` + `.agents/skills/` |
