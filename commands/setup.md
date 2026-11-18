---
description: Set up the owner from a CV in chat
---

Agent home: {{AGENT_HOME}}

Resolve ALL relative paths and shell working directories against the agent home above, not the currently open project. Read its AGENTS.md, docs/execution-safety.md and docs/cli-installation.md first. Never modify unrelated project files.

Read skills/00-onboarding-chat.md from that home. Extract only supplied facts, confirm missing/legal answers, preserve private context, perform owner-controlled login, and provision Notion only with opt-in approval. Setup never submits.

Actual MCP tools and permissions are required. Portable commands do not bypass IDE approvals or register identically in every IDE/version. For helper commands, use the agent-home runtime package; if installing into an existing project, see .job-hunter-runtime.json and docs/cli-installation.md before running npm commands.
