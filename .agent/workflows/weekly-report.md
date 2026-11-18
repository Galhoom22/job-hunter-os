---
description: Generate measured weekly skill-gap and market reports in Markdown and optional Notion
---

1. Read AGENTS.md, docs/execution-safety.md and docs/chat-commands.md.
2. Read skills/weekly-insights.md. Use validated real local history, explicit UTC period, unique job IDs and confirmed receipt counts; no invented whole-market claims. Acquire the owned run lock for writes. Save the schema JSON and private Markdown; validate. Sync opt-in Notion query-before-create only; report failed sync honestly. Release your lock.
3. Actual MCP tools and local permissions must be available; instructions alone do not install servers or schedule tasks.
