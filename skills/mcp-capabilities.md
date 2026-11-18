---
name: mcp-capabilities
version: "1.1.0"
description: Load when setup, tailoring or a run first needs browser or Notion tools; maps the tools the IDE actually exposes and verifies the dedicated persistent browser profile before anything depends on them.
triggers:
  - start of /setup
  - before the first browser action of a session
  - browser or Notion tool error
requires_mcp:
  - playwright
preconditions:
  - IDE tool metadata readable
requires_skills: []
verification:
  - navigation, snapshot, click/type, tabs, screenshot and file upload tools were each found by name
  - the browser profile path resolves to <agent home>/browser-profile
  - Notion capability reported as verified or local-only, never assumed
---
# MCP capability negotiation

## When to Use & Preconditions

Use to negotiate capabilities; it does not install MCP servers.

- **Load when:** start of /setup; before the first browser action of a session; browser or Notion tool error.
- **Preconditions (stop if any is false):**
  - IDE tool metadata readable
- **Requires skills:** none. **MCP:** playwright.

## Deterministic Step-by-Step Execution

1. Inspect actual tool metadata in the current IDE. Server names and method spelling vary; map capabilities rather than inventing calls. Browser needs navigation, accessibility snapshots, ref/role-based click/type/select, waits, tab listing/switching, screenshots and file uploads. No tool available means stop the automated run and offer skills/fallback-no-mcp.md; never pretend clipboard/manual work is verified automation.
2. Verify one dedicated persistent, headed Chromium profile under this repo. Configuration is in mcp/mcp.template.json; relative paths must resolve to this repo, not the IDE's working directory. Close any competing instance before reconnecting; never delete its locks or cookies automatically.
3. PDF is optional in Playwright MCP versions: use a listed `browser_pdf`/print-to-PDF tool ONLY when actually exposed and its schema supports an explicit local path. Do not promise it exists universally. If absent, offer the existing local `npm run resume:render` helper (verified facts only), an IDE-supported local print capability with owner permission, or manual Print → Save as PDF. No backend is needed. Without a verified PDF, stop at needs_review, not Submit.
4. Notion is optional. Inspect search, page/database/data-source retrieve/create/query/update capabilities and current schemas. A read-only connector cannot provision tracking. Ask the owner to grant the needed access or stay local-only; never fake IDs or success.
5. Test navigation/snapshot on a chosen public page before a daily run (during setup only); don't submit forms as a connectivity check. Confirm Notion operations through the dedicated setup skill, not token inspection.
6. MCP tools and IDE permission prompts are external dependencies, not installed by these Markdown files. Read-only/approval modes remain respected. No stealth flags, fingerprint evasion, CAPTCHA solvers or browser_eval-driven form bypasses.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Calling a tool name from memory → ✅ map the actual exposed tool names.
- ❌ Promising PDF printing because another IDE had it → ✅ check this IDE's tools.
- ❌ Submitting a form as a connectivity test → ✅ test with a public page only.

### Self-verification check (before reporting this step complete)
- [ ] navigation, snapshot, click/type, tabs, screenshot and file upload tools were each found by name
- [ ] the browser profile path resolves to <agent home>/browser-profile
- [ ] Notion capability reported as verified or local-only, never assumed

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
