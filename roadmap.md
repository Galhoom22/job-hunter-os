# Repository readiness audit

## Modular agent_skills architecture and skill package manager
- [x] Add strict SKILL.md frontmatter and the three mandatory sections to every skill; support skills/<name>/SKILL.md folders alongside flat files.
- [x] Generate skills/REGISTRY.md and skills/skills-manifest.json; add the Progressive Disclosure rule to AGENTS.md and IDE pointers.
- [x] Add four meta-skills (self-verification, DOM recovery, context compaction + checkpoint contract, structured debugging) and wire them into the run.
- [x] Add `skills list|validate|sync|install|enable|disable|export` to the CLI (Node built-ins only; community skills disabled until reviewed).
- [x] Add 8 Career-Ops capabilities (ghost-job detector, `verify-cv` anti-hallucination guard, AI-slop humanizer, 75-word hiring-manager outreach drafter, direct email drafter, EEO/GDPR compliance defaults, interview JD dossier, and `pull-ats` JSON feed harvester).
- [x] README section and tests for manifest, frontmatter, list/validate/install/export, verify-cv, and pull-ats.

## Bulletproof resume intake, multi-format CVs and batch triage
- [x] Add resume ingestion playbook and dependency-free `parse-cv` (text, PDF, DOCX, unreadable/scanned detection).
- [x] Add structured resume data schema/example and validator for deterministic repeater fields.
- [x] Add `render-cv` (HTML/JSON -> HTML, PDF when Chromium exists, Word .doc, TXT) and cover-letter template; per-job folders with tailoring notes.
- [x] Rewrite form-filling rules for the five upload/autocomplete/session traps; reconcile mid-run login-wall pause with stop rules.
- [x] Add two-phase batch triage (workflow_mode, Tier A/B/C, skipped-jobs log, Mission Control table, APPLY replies) and Easy Apply vs external-tab handling.
- [x] Update AGENTS.md, README and tests; save without src changes.
- [ ] Live portal behaviour (auto-parse overwrites, cross-origin dropzones, autocomplete, mid-run session expiry, real Easy Apply/redirect tabs): needs owner sessions and real job forms; only synthetic files and local renders were tested.

## Three-tier browser companion and approval workflow
- [x] Add a no-build MV3 companion with extraction, reviewed autofill and single-use approval-only submission/profile staging.
- [x] Add approval policy contracts, private validated prompt bundling and MCP/web-chat/profile/resume skills.
- [x] Document privacy/fallback limits; verify 117 tests and isolated Chromium form flow without src changes.
- [ ] Live extension installation, employer forms and persisted profile edits: requires owner-installed Chrome/Edge, authorized sessions, confirmed facts and exact-text approval; test fixtures do not verify real sites.

## Flagship engineering guide and dynamic search registry
- [x] Expand disabled target templates with platform URL patterns, parameters and ATS discovery channels.
- [x] Rewrite the README into ten architecture, setup, lifecycle, compatibility and contribution sections.
- [x] Validate 107 tests, installation preservation, registry contracts and documentation links; leave src untouched.

## Strict readiness gatekeeper
- [x] Add five-gate schema, private state template, shared audit and CLI/preflight enforcement.
- [x] Add 3–4-question interview, CV drop guide, scoped answer learning and per-run launch confirmation.
- [x] Update all IDE/command entrypoints and documentation; verify 91 tests and save the request commit.

## Universal CLI installation
- [x] Implement dependency-free local/global CLI and non-destructive MCP/IDE injection.
- [x] Add transparent POSIX/PowerShell installers and six portable commands.
- [x] Test isolated installation, packaged npm executable, doctor, MCP merges and platform registration.
- [x] Document installation paths, tool limitations and privacy; save without src changes.

## Chat-first playbook shift
- [x] Add conversational onboarding, Notion provisioning and MCP capability checks.
- [x] Add truth-preserving agent tailoring and accessible PDF workflow.
- [x] Expand grouped platform and ATS playbooks and five IDE workflows.
- [x] Align warm-up/pacing rules and test the safety decisions without frontend changes.
- [x] Rewrite flagship documentation and validate links/contracts; save in the request commit.

## Open-source companion upgrade
- [x] Interactive setup, optional Notion, browser login and dashboard readiness.
- [x] Verified-fact resume tailoring and deterministic PDF renderer.
- [x] Conservative warm-up, active hours and cooldown controls (no stealth/evasion).
- [x] Local JSON/CSV/Markdown adapters and dashboard exports.
- [x] Community platform template, MIT license and contributor/security documentation.
- [x] Test scripts and dashboard flows; record live-service limitations.

- [x] Add multi-IDE pointers and safe MCP headed/headless generation.
- [x] Expand platform and ATS playbooks and disabled target templates.
- [x] Enforce scoring, uploads, deduplication, run locking and stop rules.
- [x] Harden Notion retry/analytics instructions and validation/preflight.
- [x] Untrack private context/history and isolate bundled demo data.
- [x] Run tests, validation and dashboard checks; document real-run blockers.
## External blockers (not implemented or verified)
- [ ] Real chat onboarding/application dry run and Notion read-back: waiting for owner-verified CV/answers, approved targets, actual IDE MCP tools, headed sessions and opt-in Notion access.
- [ ] Native slash-command and unattended IDE compatibility: depends on installed IDE/version and an authorized running local agent; portable chat prompts are provided, no scheduler is installed.
