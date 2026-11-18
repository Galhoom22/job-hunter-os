# Chat commands and IDE portability

All commands are owner requests, not background schedules. Read AGENTS.md first. Native slash-command registration varies by IDE/version; a Markdown workflow is not universally an installed command. If a slash command is absent, paste the fallback prompt or ask the agent to read the linked workflow.

| Alias | Fallback chat prompt | Workflow | Skill |
|---|---|---|---|
| /setup | Setup my profile from this CV and help me log in | [setup](../.agent/workflows/setup.md) | [onboarding](../skills/00-onboarding-chat.md) |
| /daily-run | Run today's job discovery, CV tailoring and applications using configured safety settings | [daily-run](../.agent/workflows/daily-run.md) | [orchestrator](../skills/00-daily-run.md) |
| /tailor-cv | Tailor my CV for this job URL; do not apply | [tailor-cv](../.agent/workflows/tailor-cv.md) | [tailoring](../skills/tailor-resume.md) |
| /apply-url | Score, tailor and safely process this one job URL | [apply-url](../.agent/workflows/apply-url.md) | [single URL](../skills/apply-url.md) |
| /weekly-report | Generate my weekly market and skill-gap report in Markdown and optional Notion | [weekly-report](../.agent/workflows/weekly-report.md) | [insights](../skills/weekly-insights.md) |
| /linkedin-growth | Review my LinkedIn profile or draft a post; do not save or publish without approval | [linkedin-growth](../.agent/workflows/linkedin-growth.md) | [profile](../skills/linkedin-profile-update.md), [posts](../skills/linkedin-post.md) |

| IDE | Canonical instruction entry | Workflow activation |
|---|---|---|
| Antigravity | AGENTS.md + .agent/workflows/ | Use supported workflow commands; fallback prompts above |
| Cursor | .cursor/rules/job-hunter.mdc | Ask the agent to read the workflow; native commands depend on version |
| Claude Code | CLAUDE.md | Chat prompts or locally configured native commands; this repo does not claim automatic slash registration |
| Windsurf | .windsurfrules | Supported local workflows or explicit read-workflow prompt |
| Cline / Roo | .clinerules | Chat prompt and MCP permissions |
| GitHub Copilot | .github/copilot-instructions.md | Agent chat where MCP/local tool access is supported |

Resolve links from the repo root, not the terminal's incidental working directory. Tool approvals still apply to file writes, installs, browser access and Notion creation. No web server is needed for these workflows.

The CLI installs six commands from commands/ with the resolved agent-home path. Global paths and Cline/manual import limitations are documented in [installation](cli-installation.md). Never resolve global context/helper cwd against an unrelated active project. Outreach through /linkedin-growth has a 75-word cap; posts keep their separate limits.
