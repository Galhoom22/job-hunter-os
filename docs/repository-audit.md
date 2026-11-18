# Repository Audit — Zero-Code Markdown Skills & MCP Architecture

## Status
Audited and reset to a **100% Pure Zero-Code AI Agent Skills, Templates, Context, and MCP Configuration** repository (retaining only the minimal Lovable build placeholder in `src/` and `package.json` without referencing it in docs or workflows).

## Purged Code & Bloat
- Removed `bin/` (all CLI `.mjs` scripts)
- Removed `scripts/` (TypeScript helpers, log validators, and test suites)
- Removed `extension/` (Chrome/Edge MV3 JS extension)
- Removed `schemas/*.ts` custom TypeScript policy/analytics code and `vitest`/`eslint` configs
- Replaced dashboard UI in `src/` with a minimal single-page static placeholder for Lovable build compatibility

## Verified Pure-Markdown Repository Structure
- `AGENTS.md`, `CLAUDE.md`, `.windsurfrules`, `.clinerules`, `.cursor/rules/job-hunter.mdc`, `.github/copilot-instructions.md` — canonical instructions enforcing Progressive Disclosure (`AGENTS.md` -> `skills/REGISTRY.md` -> active skill only).
- `skills/`:
  - `skills/REGISTRY.md` & `skills/skills-manifest.json` — progressive-disclosure index of all 35 playbooks.
  - Core numbered workflow playbooks: `00-daily-run.md`, `00-interrogate-and-onboard.md`, `01-resume-ingestion.md`, `02-discover-and-triage.md`, `03-tailor-resume-and-verify.md`, `04-fill-and-apply.md`, `05-outreach-and-interview-prep.md`, `06-log-and-insights.md`.
  - Four meta-skills: `meta-self-verification.md`, `meta-dom-recovery.md`, `meta-context-compaction.md`, `meta-structured-debugging.md`.
  - Sixteen job-board playbooks (`skills/platforms/*.md` + `_template.md`) and seven ATS engine playbooks (`skills/ats/*.md`).
- `.agent/workflows/` & `commands/` — six portable chat/slash commands (`/setup`, `/daily-run`, `/tailor-cv`, `/apply-url`, `/weekly-report`, `/linkedin-growth`).
- `context/*.example` & `config/guardrails.yaml` — synthetic templates (including `eeo_and_compliance_defaults` and `board_tokens`).
- `templates/` — single-column semantic HTML templates (`ats-resume-template.html`, `ats-cover-letter-template.html`).
- `mcp/mcp.template.json` — canonical Playwright MCP (`--user-data-dir=./browser-profile`) and optional Notion MCP definition.
- `demo/` — synthetic read-only sample JSON/YAML fixtures.

## Live-Run Prerequisites (Handled by the AI Agent in Chat)
Real CV/profile facts in `context/`, authorized browser sessions in `./browser-profile/`, optional Notion database IDs/token, and owner launch/submit approvals are collected interactively via `skills/00-interrogate-and-onboard.md`.
