# Changelog

All notable changes to **`job-hunter-os`** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
