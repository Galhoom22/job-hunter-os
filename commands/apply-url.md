---
description: Score and safely process one owner-supplied job URL
---

Agent home: {{AGENT_HOME}}

Resolve ALL relative paths and shell working directories against the agent home above, not the currently open project. Read its AGENTS.md, docs/execution-safety.md and docs/cli-installation.md first. Never modify unrelated project files.

Read skills/apply-url.md from that home. Use $ARGUMENTS or the URL supplied in chat. One job only; successful preflight/auth/context before discovery, scoring, tailoring and shared final gate. Dry run, caps and unknown facts override the request to apply immediately.

Actual MCP tools and permissions are required. Portable commands do not bypass IDE approvals or register identically in every IDE/version. For helper commands, use the agent-home runtime package; if installing into an existing project, see .job-hunter-runtime.json and docs/cli-installation.md before running npm commands.

Mandatory Step 0 for application requests: read skills/00-interrogate-and-onboard.md, audit the five readiness gates, hard-block incomplete/placeholders, interview in 3–4-question batches, and obtain fresh mission-briefing launch confirmation. This precedes and preserves lock/preflight → auth → context. Setup/Check my folder uses the same interview but does not launch applications. Other commands do not grant application permission.
