# Chat commands and IDE portability

All commands are owner requests executed directly by the AI model in chat—no scripts or background daemons exist. Read `AGENTS.md` and `skills/REGISTRY.md` first.

| Alias | Fallback chat prompt | Workflow | Skill |
|---|---|---|---|
| `/setup` | Setup my profile from this CV and help me log in | [setup](../.agent/workflows/setup.md) | [00-interrogate-and-onboard](../skills/00-interrogate-and-onboard.md), [01-resume-ingestion](../skills/01-resume-ingestion.md) |
| `/daily-run` | Run today's job discovery, CV tailoring, and gated applications | [daily-run](../.agent/workflows/daily-run.md) | [00-daily-run](../skills/00-daily-run.md) |
| `/tailor-cv` | Tailor my CV for this job URL; do not apply | [tailor-cv](../.agent/workflows/tailor-cv.md) | [03-tailor-resume-and-verify](../skills/03-tailor-resume-and-verify.md) |
| `/apply-url` | Score, tailor, and safely process this one job URL | [apply-url](../.agent/workflows/apply-url.md) | [00-daily-run](../skills/00-daily-run.md) |
| `/weekly-report` | Generate my weekly market and skill-gap report | [weekly-report](../.agent/workflows/weekly-report.md) | [06-log-and-insights](../skills/06-log-and-insights.md) |
| `/linkedin-growth` | Review my LinkedIn profile or draft a post/outreach; wait for approve | [linkedin-growth](../.agent/workflows/linkedin-growth.md) | [05-outreach-and-interview-prep](../skills/05-outreach-and-interview-prep.md) |

| IDE | Canonical instruction entry | Workflow / Command location |
|---|---|---|
| Antigravity | `AGENTS.md` + `skills/REGISTRY.md` | `.agent/workflows/` (or `~/.antigravity/workflows/`) |
| Cursor | `.cursor/rules/job-hunter.mdc` | Ask the agent to read `.agent/workflows/<command>.md` |
| Claude Code | `CLAUDE.md` | `commands/*.md` (or `~/.claude/commands/` + `~/.claude/skills/`) |
| Windsurf | `.windsurfrules` | `.agent/workflows/` or `~/.windsurf/workflows/` |
| Cline / Roo | `.clinerules` | Chat prompt + MCP settings |
| GitHub Copilot | `.github/copilot-instructions.md` | Agent chat with MCP + local file tools |
