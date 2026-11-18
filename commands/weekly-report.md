---
description: Generate measured local and optional Notion insights
---

Agent home: {{AGENT_HOME}}

Resolve ALL relative paths and shell working directories against the agent home above, not the currently open project. Read its AGENTS.md, docs/execution-safety.md and docs/cli-installation.md first. Never modify unrelated project files.

Read skills/weekly-insights.md from that home. Use validated real history and explicit UTC period. Acquire owned lock for writes; count unique jobs and confirmed receipts, create JSON and Markdown, validate, optionally upsert Notion and report any sync blocker.

Actual MCP tools and permissions are required. Portable commands do not bypass IDE approvals or register identically in every IDE/version. For helper commands, use the agent-home runtime package; if installing into an existing project, see .job-hunter-runtime.json and docs/cli-installation.md before running npm commands.

Mandatory Step 0 for application requests: read skills/00-interrogate-and-onboard.md, audit the five readiness gates, hard-block incomplete/placeholders, interview in 3–4-question batches, and obtain fresh mission-briefing launch confirmation. This precedes and preserves lock/preflight → auth → context. Setup/Check my folder uses the same interview but does not launch applications. Other commands do not grant application permission.
