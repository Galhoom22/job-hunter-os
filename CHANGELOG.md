# Changelog

All notable changes to **`job-hunter-os`** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-11-18 — Resilience, Security & Chaos Shield Edition

### Added
- **3 New Security, Anti-Ban & Chaos-Resilience Skills (`57` Total Skills in `skills/REGISTRY.md` & `skills/skills-manifest.json`):**
  - [`skills/24-circuit-breaker-and-antiban.md`](skills/24-circuit-breaker-and-antiban.md) + [`.agents/skills/circuit-breaker-and-antiban/SKILL.md`](.agents/skills/circuit-breaker-and-antiban/SKILL.md): Defines immediate trip conditions (CAPTCHA, Cloudflare/DataDome/Arkose frames, HTTP 429/403 rate limits, unusual-activity banners, or forced login redirects) and persists a 24-hour platform lock in `logs/circuit-breaker.json`.
  - [`skills/25-prompt-injection-defense.md`](skills/25-prompt-injection-defense.md) + [`.agents/skills/prompt-injection-defense/SKILL.md`](.agents/skills/prompt-injection-defense/SKILL.md): Treats all scraped JDs and form labels inside `browser_snapshot` as `UNTRUSTED_EXTERNAL_DATA`, blocks indirect prompt injections and honeypot trap fields, and distinguishes benign recruiter Easter-egg attention checks (`"Include PINEAPPLE in cover letter"`) in the Mission Control Table.
  - [`skills/26-deduplication-and-blacklist-guard.md`](skills/26-deduplication-and-blacklist-guard.md) + [`.agents/skills/deduplication-and-blacklist-guard/SKILL.md`](.agents/skills/deduplication-and-blacklist-guard/SKILL.md): Enforces `blacklisted_companies` and `blacklisted_domains` in `context/preferences.yaml` plus cross-channel canonical job fingerprinting (`normalize(company)::normalize(role_title)`) against `logs/applications-log.json`.
- **Pre-Submit Final DOM Read-Back & PDF Page-Overflow Gate:**
  - Updated [`skills/04-fill-and-apply.md`](skills/04-fill-and-apply.md) to require a **Live DOM Read-Back Table** from a fresh `browser_snapshot` before requesting `APPROVE`, verifying attached `resume.pdf` filename, phone country code, dropdown values, and empty honeypot fields.
  - Updated [`skills/03-tailor-resume-and-verify.md`](skills/03-tailor-resume-and-verify.md) and [`templates/ats-resume-template.html`](templates/ats-resume-template.html) with character/bullet budgets and `@media print` `orphans`/`widows`/`break-inside` rules to prevent 2-page orphan spills.
- **CLI Crash Recovery (`unlock`), JSON Integrity Backup (`backup`) & Git Pre-Commit PII Shield (`bin/cli.mjs`):**
  - `npx job-hunter-os unlock`: Safely removes stale Chromium lock files (`SingletonLock`, `SingletonCookie`, `SingletonSocket`, `lockfile`, `DevToolsActivePort`) from `browser-profile/` after a browser crash across Windows, macOS, and Linux.
  - `npx job-hunter-os backup`: Verifies JSON parse integrity of `logs/applications-log.json`, `logs/skipped-jobs.json`, and `logs/circuit-breaker.json` and snapshots `context/` + `logs/` into timestamped `logs/backups/backup-<timestamp>/` directories.
  - Automatic `.git/hooks/pre-commit` PII & secret shield installed during `init` and `doctor` to block accidental commits of private `context/*`, `*.pdf`, `browser-profile/`, `logs/`, or API tokens (`ntn_`, `sk-`, `ghp_`).

## [1.0.0] - 2026-11-18

### Added
- **54-Skill Progressive Disclosure Catalog (`skills/REGISTRY.md` & `skills/skills-manifest.json`):**
  - **25 Core & Career-Ops Playbooks (`00`–`23` + `fallback-no-mcp`):** Readiness Gatekeeper with live URL reachability verification (`00`), Daily Run Orchestrator (`00`), Pure-AI CV Ingestion (`01`), Batch Discovery, Ghost-Job Filter & Mission Control (`02`), Anti-Hallucination HTML/PDF Tailoring & Humanizer (`03`), Upload-First ATS Form Filling & `APPROVE` Gate (`04`), Interview Dossier & `<= 75`-Word Outreach (`05`), Local JSON + Optional Notion Sync & Weekly Reports (`06`), Multi-Persona Career Switcher (`07`), 7-Day Follow-Up Radar (`08`), Salary & B2B Rate Negotiator (`09`), Scheduled `/loop` Runner (`10`), GitHub & Portfolio Auditor (`11`), Recruiter Inbox Triage (`12`), Company Due Diligence & Health Badges (`13`), Privacy & PII Redaction Shield (`14`), Multilingual & RTL Adaptation (`15`), Rejection Pattern Analyzer (`16`), Score Calibration & Weight Tuner (`17`), Condition-Based Browser Waiting (`18`), On-Demand MCP Tool Routing (`19`), Skill Authoring Standard (`20`), ATS Keyword Heatmap (`21`), Technical Assessment Architect (`22`), and Employment Contract & B2B NDA Auditor (`23`).
  - **4 Reliability Meta-Skills:** `meta-self-verification`, `meta-dom-recovery`, `meta-context-compaction`, and `meta-structured-debugging`.
  - **18 Job-Board & Regional Playbooks (`skills/platforms/`):** LinkedIn, Wellfound, Indeed, Glassdoor, WeWorkRemotely, RemoteOK, Welcome to the Jungle (Otta), BuiltIn, Dice, ZipRecruiter, Wuzzuf, Bayt, B2B Contract Networks (`Toptal`, `Braintrust`, `Lemon.io`, `Gun.io`, `Contra`, `Arc.dev`, `Turing`), plus regional/category routers (`global-boards`, `remote-boards`, `mena-boards`, `ats-engines`).
  - **7 Employer ATS Engine Playbooks (`skills/ats/`):** Greenhouse, Lever, Ashby, SmartRecruiters, BreezyHR, Workday, and Taleo.
- **Complete `agentskills.io` Auto-Discovery (`.agents/skills/*/SKILL.md`):**
  - Synchronized `SKILL.md` wrappers for all primary workflows (`00`–`23`), meta-skills, and slash-command entrypoints so `/skills` auto-discovers immediately in VS Code Copilot, Cursor, OpenAI Codex CLI, OpenCode, Goose, Amp, and Zed.
- **Zero-Dependency Cross-Platform Node.js CLI (`bin/cli.mjs`) & OS One-Liners (`scripts/install.sh`, `scripts/install.ps1`):**
  - Built strictly on Node.js 18+ built-in modules (`dependencies: {}`, `devDependencies: {}`).
  - Commands: `init [--global] [--ide <name>]`, `update`, `doctor` (with live profile/portfolio URL verifier), `status` (gates, warm-up cap & funnel summary), `bundle` (single-file web-chat master prompt exporter to `logs/exports/web-chat-master-prompt.md`), `dashboard` (local Kanban & analytics generator at `logs/exports/dashboard.html`), `login`, and `sync-mcp`.
- **Zero-Server Local HTML Kanban & Analytics Dashboard (`templates/analytics-dashboard.html`):**
  - Single-file HTML/CSS/JS dashboard displaying KPI cards, 5-column lifecycle Kanban board (`Applied`, `Interviewing`, `Technical Assessment`, `Offer`, `Rejected / Ghosted`), platform yield breakdown, instant JSON file loader, and synthetic demo mode.
- **15-Second Sandbox `/demo` Mode & Real Output Showcase (`examples/`):**
  - Fictional profile, 3 sample JDs, and expected Mission Control output in `examples/sandbox-demo/`.
  - Sample interview dossier, `<= 75`-word hiring manager outreach, and onboarding transcript in `examples/outputs/`.
- **25+ AI IDE Entrypoints & 6 Model-Specific Tuning Guides (`adapters/`):**
  - Native rules/workflows for Antigravity, Cursor, Claude Code, Claude Desktop, Gemini CLI, OpenAI Codex CLI, Devin Desktop / Windsurf, OpenCode, Kilo Code, Cline, Roo Code, JetBrains Junie, AWS Kiro, Trae, Zed, Goose, Aider, OpenHands, Warp, Augment, Crush, and GitHub Copilot.
- **Ecosystem & Governance Standards:**
  - `PLATFORMS.md` compatibility matrix, `llms.txt` (`llmstxt.org` discovery), `HIRED.md` community success ledger, MIT `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, cross-OS GitHub Actions CI (`.github/workflows/validate-repo.yml`), and automated npm release workflow (`.github/workflows/publish-npm.yml`).
