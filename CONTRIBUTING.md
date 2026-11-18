# Contributing to job-hunter-os

Small, testable changes welcome. Never include real context, applications, resumes, screenshots, cookies, tokens or generated MCP configs in a PR.

## Add a job board
1. Copy skills/platforms/_template.md to a lowercase platform key. Keep steps concise and use accessibility snapshots/roles/labels/refs only.
2. Add the key to Platform in schemas/index.ts, a disabled target to context/targets.yaml.example and demo/targets.yaml, a conservative cap in config/guardrails.yaml and registry entry in docs/platform-registry.md.
3. Describe canonical posting ID extraction, auth requirements, final-submit semantics, supported ATS redirects and manual fallback. Cite tested date/version and known limitations. Never assume Quick Apply is reversible.
4. Add a small rule test next to src/test covering eligibility, duplicates or submission safety affected by your change. Run npm test and npm run validate:logs -- --demo. Do not include private browser sessions.

## Improve ATS forms
Fresh snapshot before each step; unknown answers and complex portals need review. No DOM injection, stealth plugins, CAPTCHA solvers, fabricated answers or automatic account creation. Ensure dry runs cannot accidentally submit.

## Development
npm install; npm run setup; npm run dev. Chromium install may be needed: npx playwright install chromium. setup:check checks local prerequisites and returns nonzero if incomplete; CI should use synthetic temporary fixtures rather than committed personal data. Node 22+ recommended.

Use semantic design tokens and existing UI controls. Preserve TanStack routes and server boundaries. Local CLI code can use Node/Playwright; hosted functions cannot launch a browser and never read private files in production. Include desktop/mobile evidence for dashboard controls, not private screenshots.
