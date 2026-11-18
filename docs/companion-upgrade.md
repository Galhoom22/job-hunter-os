# Open-source companion upgrade — 2026-11-18

## Added
- scripts/setup.ts + setup-lib.ts: non-overwriting template initialization, interactive identity/facts/IDE prompts, timezone detection, public-board enable option and private MCP generation. setup:check is read-only, exits nonzero for incomplete owner prerequisites.
- scripts/browser-login.ts: manual headed login using the persistent local profile; Chromium install and desktop display may be needed.
- skills/tailor-resume.md, context/resume-facts.json.example, schemas/resume.ts, templates/ats-resume.html, scripts/render-resume.ts: deterministic keyword-prioritized ordering of exact verified sentences/skills/bullets, escaped single-column HTML, network-blocked local PDF and provenance manifest. No model-generated or fabricated experience.
- schemas/runtime.ts: optional storage, progressive 5/day warm-up on days 1–3, IANA active hours, 3–9s delays, minimum 60-second cooldown.
- schemas/exports.ts + scripts/export-lib.ts/export.ts: formula-safe CSV and Markdown; journal and reports auto-export when enabled.
- Dashboard quick-setup dialog + polled health, profile save, runtime controls, CSV/JSON downloads and Markdown copy on Applications/Insights. Mobile content width constrained.
- skills/platforms/_template.md and docs/platform-registry.md; MIT LICENSE, flagship README, CONTRIBUTING and truthful SECURITY privacy boundaries.

## Upgraded
package.json/bun.lock, schemas/index.ts, scripts/preflight.ts/sync-mcp.ts/journal.ts/insights.ts, config/guardrails.yaml + demo copy, AGENTS.md, execution-safety docs, pacing/daily-run/form-fill/log/report playbooks, src/lib/repo-data.functions.ts, four content pages and app shell/page header. Notion defaults off; local operation no longer needs token/database IDs. All content routes retain unique title/description/social metadata.

## Verification
- 58 tests pass across seven suites, including setup preservation, privacy, exact score/caps, warm-up, timezone, cooldown, resume fact preservation/HTML escaping and CSV injection protection.
- Preview build/typecheck reports build OK; no manual build invoked.
- All five routes render without page errors. Setup dialog opens, CSV + JSON downloads contain expected rows, Markdown copy verified. Profile save and config timezone change persist and read back through UI; test facts/settings restored.
- Renderer produced a real 21,399-byte PDF from synthetic verified fixture in /tmp; local exports validated. No owner CV was uploaded to any employer.
- setup:check reports missing verified facts/resume/browser and exits 1 as intended. MCP generation succeeds with Notion off, without secrets. Logs and synthetic demo validation pass.

## Remaining boundaries
No real employer application, live resume upload, Notion access/read-back or first-time headed login was exercised. Those require the owner's authorized environment and facts. The agent must follow timing/cooldown instructions; dashboard is not an automation daemon or installed scheduler. IDE settings/slash-command support varies by version. No guarantee of under-two-minute complete authorization, GitHub Trending adoption, ATS conversion uplift or no account bans.

“Stealth/anti-ban” was replaced with transparent conservative pacing and hard stops; no bypass, concealment or CAPTCHA solving. Cookies and personal artifacts are not committed, but employers receive submitted facts/PDFs, optional Notion receives selected records and selected AI IDEs/models have their own privacy policies. Nothing-ever-leaves-machine would be false.
