---
name: condition-based-browser-waiting
description: Load when handling Playwright MCP async UI waits, ATS resume uploads, modals, or flaky transitions using snapshot condition checks and Role/Label locator priority.
---

# Job Hunter Condition-Based Browser Waiting

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Follow `skills/18-condition-based-browser-waiting.md` to wait for explicit `browser_snapshot` readiness conditions (upload badge, modal mount, spinner removal) instead of blind guesses, prioritize `Role -> Label -> Placeholder -> Text`, and maintain 3-9s human pacing.
