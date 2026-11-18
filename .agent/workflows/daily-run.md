---
description: Run the daily autonomous job discovery, scoring, and application pipeline
---

1. Read `AGENTS.md` fully and obey every hard guardrail.
2. Execute `skills/00-daily-run.md` from its first step: acquire the owned run lock, then run `npm run preflight`. Stop if it fails; validate aborted JSON and release only your lock.
3. Continue that orchestrator step by step using Playwright and Notion MCP; never repeat its setup or skip auth/context.
4. Finish with the run report in chat and confirm `npm run validate:logs` passes.
