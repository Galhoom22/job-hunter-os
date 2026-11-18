# Job Hunter — GitHub Copilot

Read [AGENTS.md](../AGENTS.md) from the repository root before any task; it is canonical. The product is chat + Markdown skills + MCP, not the web preview.

Use docs/chat-commands.md for all five workflows:
- /setup or “Setup my profile from this CV” → skills/00-onboarding-chat.md
- /daily-run or “Run today's job run” → skills/00-daily-run.md
- /tailor-cv or “Tailor my CV for this job URL; do not apply” → skills/tailor-resume.md
- /weekly-report or “Generate my weekly market/skill-gap report” → skills/weekly-insights.md
- /linkedin-growth or “Optimize my profile or draft a post” → profile/post skills; exact-text approval before Save/Post

Native slash registration depends on IDE/version; use chat prompts or read .agent/workflows/<command>.md if unavailable. Connect MCP using mcp/README.md and the canonical mcp/mcp.template.json, dedicated persistent browser-profile and actual tool permissions. Optional Notion; local JSON primary. Setup may run local helpers with permission; never ask owners to paste secrets or manually edit YAML. Daily runs must acquire the owned lock, then pass preflight/auth/context in order. Leave src/ untouched.
