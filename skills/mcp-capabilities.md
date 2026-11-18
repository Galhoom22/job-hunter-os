---
name: mcp-capabilities
description: Verify browser and optional Notion MCP tools before onboarding, tailoring, or a local authorized run.
---
# MCP capability negotiation

1. Inspect actual tool metadata in the current IDE. Server names and method spelling vary; map capabilities rather than inventing calls. Browser needs navigation, accessibility snapshots, ref/role-based click/type/select, waits, tab listing/switching, screenshots and file uploads. No tool available means stop and name the missing capability.
2. Verify one dedicated persistent, headed Chromium profile under this repo. Configuration is in mcp/mcp.template.json; relative paths must resolve to this repo, not the IDE's working directory. Close any competing instance before reconnecting; never delete its locks or cookies automatically.
3. PDF is optional in Playwright MCP versions: use a listed `browser_pdf`/print-to-PDF tool ONLY when actually exposed and its schema supports an explicit local path. Do not promise it exists universally. If absent, offer the existing local `npm run resume:render` helper (verified facts only), an IDE-supported local print capability with owner permission, or manual Print → Save as PDF. No backend is needed. Without a verified PDF, stop at needs_review, not Submit.
4. Notion is optional. Inspect search, page/database/data-source retrieve/create/query/update capabilities and current schemas. A read-only connector cannot provision tracking. Ask the owner to grant the needed access or stay local-only; never fake IDs or success.
5. Test navigation/snapshot on a chosen public page before a daily run (during setup only); don't submit forms as a connectivity check. Confirm Notion operations through the dedicated setup skill, not token inspection.
6. MCP tools and IDE permission prompts are external dependencies, not installed by these Markdown files. Read-only/approval modes remain respected. No stealth flags, fingerprint evasion, CAPTCHA solvers or browser_eval-driven form bypasses.
