# Job Hunter OS

### Truthful CV Tailoring for the AI Agent You Already Use.

Give your existing AI coding agent (**Cursor, Claude Code, Antigravity, Windsurf, Cline, Gemini CLI, Codex, OpenCode**) one CV and one job description. Get a fact-checked tailored HTML/TXT resume, a transparent evidence map, an ATS keyword comparison, and an explicit list of missing skills.

No fabricated experience. No blind applications. No external API keys. You remain in control.

**48 Markdown Skills** · **0 Core npm Dependencies** · **Local-First** · **Human-Controlled**

**[Explore the CV Tailoring Demo ↗](https://redasalem.github.io/job-hunter-os/)** · **[Quick Installation](#installation)** · **[العربية (RTL)](README.ar.md)**

[![Zero Core Dependencies](https://img.shields.io/badge/Core_CLI-0_NPM_Dependencies-2ea44f)](package.json)
[![48 Markdown Skills](https://img.shields.io/badge/Skills-48_Markdown_Skills-167d60)](skills/REGISTRY.md)
[![MIT License](https://img.shields.io/badge/License-MIT-2ea44f)](LICENSE)

```bash
# Try an instant offline hygiene audit on your own resume right now (zero setup, local-only)
npx github:redasalem/job-hunter-os audit ./resume.md --share
```

---

## Actual CV Tailoring Output (Synthetic Example)

All names, employers, and metrics below come from synthetic repository fixtures ([`evals/fixtures/`](evals/fixtures/candidate-profile.md)) to illustrate the exact output structure produced by `/demo` and `/quick-tailor`:

![Job Hunter OS — Truthful CV Tailoring Output Preview (Synthetic Demonstration Data)](assets/demo-preview.png)

| Input You Provide | Output You Receive |
|---|---|
| Existing CV (`.md` / `.txt` / pasted text) + confirmed facts | Fact-checked single-column tailored resume (**HTML + TXT**, optional PDF) |
| One target job description (or batch during `/daily-run`) | Line-by-line **Evidence Map**, **ATS Keyword Comparison**, and explicit **True Gaps** |
| Optional local browser session (only for full Career OS) | **Interview Dossier**, `<= 75`-word draft outreach, Live DOM Read-Back Table before `APPROVE` |

---

## Before vs. After Transformation

```diff
- Built backend APIs for an e-commerce and payments app using Node.js.
+ Built idempotent Node.js and TypeScript webhook processors backed by PostgreSQL and AWS SQS,
+ reducing payment webhook p95 latency by 38% across $4.2M daily settlement volume [verified: candidate-profile.md].
! Blocked claim: "Managed multi-cluster Kubernetes" (0 verified years — isolated under True Gaps)
[ATS Keyword Coverage: 71.4% -> 92.8% (heuristic comparison, not an ATS guarantee)]
[Status: dry_run: true · Awaiting explicit job-specific human APPROVE]
```

- **Zero invented claims:** Employers, titles, dates, tools, and metrics must trace back to your verified facts. Missing skills are never quietly added—they are listed under **True Gaps**.
- **Anti-AI slop filter:** Strips generic clichés (`delve`, `spearheaded`, `synergy`, `testament`) and prose em-dashes in favor of plain engineering language.
- **No blind submissions:** Every live ATS form submission requires an explicit, exact, job-specific human `APPROVE` after inspecting the **Live DOM Read-Back Table**. No score-based auto-submit, no batch approvals across jobs.

---

## What Makes the Workflow Trustworthy

Job Hunter OS is transparent about **which layer enforces each control** (details in [`docs/execution-safety.md`](docs/execution-safety.md)):

| Control Layer | What It Enforces | Concrete Examples |
|---|---|---|
| **Deterministic CLI Enforcement (`bin/cli.mjs`)** | Verified locally by zero-dependency Node.js code with exit codes | `pre-submit` (`<= 75`-word outreach cap & daily/Days 1–3 warm-up caps), `.git/hooks/pre-commit` PII & token blocker, JSON integrity in `backup`, live-PID check in `unlock`, SSRF guard in `doctor`/`audit`, XSS-escaped JSON in `dashboard`, SSH commit signature verification in `update`, and static fixture grading in `eval`/`proof` |
| **Agent Workflow Requirements (`AGENTS.md`, `skills/*.md`)** | Structured instructions executed by your AI model inside your IDE *(not an independent OS sandbox)* | Fact-checking CV claims against verified profile, isolating missing skills in **True Gaps**, treating scraped JDs as `UNTRUSTED_EXTERNAL_DATA`, upload-first ATS filling, Live DOM Read-Back verification, and unconditional per-job `APPROVE` pause |

> **Privacy & Automation Honesty:** CVs, logs, generated resumes, and optional `browser-profile/` stay local on your machine (zero telemetry, zero SaaS backend). Your chosen AI IDE/model processes chat prompts under its own provider policy—use a local model if strict offline privacy is required. Browser automation never bypasses CAPTCHAs, 2FA, or rate limits; any challenge trips a 24-hour platform cooldown and stops immediately.

---

## Fastest Ways to Get Started

You do **not** need browser login or full platform setup to see value:

| Step | Slash Command | Purpose | Personal CV / Browser Login? |
|---|---|---|---|
| **1. Instant Sandbox** | `/demo` | Run a 15-second synthetic simulation across 3 sample JDs ([`examples/sandbox-demo/`](examples/sandbox-demo/sample-jds.md)) with an immediate tailored preview for Job #1 | **None required** |
| **2. First Real Tailored CV** | `/quick-tailor` | Paste your real CV + 1 JD, confirm extracted facts, and get a tailored HTML/TXT CV, Evidence Map, ATS comparison, and True Gaps | **CV + 1 JD only** (no browser login) |
| **3. Full Career OS (Optional)** | `login` → `/setup` → `/daily-run` | Multi-platform job discovery, ghost-job filtering, interview dossiers, and human-approved ATS form preparation | **Browser login + 5 readiness gates** |

---

## Installation

Works on **macOS, Linux, and Windows** with Node.js `>= 18`:

```bash
# 1. Instant offline CV hygiene audit (optional --share writes privacy-safe SVG/MD card to logs/exports/)
npx github:redasalem/job-hunter-os audit ./resume.md --share

# 2. Initialize globally (~/.job-hunter-os + IDE skill/command auto-discovery)
npx github:redasalem/job-hunter-os init --global

# 3. Open your AI IDE:
#    - Run `/demo`         (instant synthetic workflow, zero setup)
#    - Run `/quick-tailor` (your real CV + 1 JD, no browser login)

# 4. Optional (Full Career OS only): sign in to local browser-profile/ and run /setup
npx github:redasalem/job-hunter-os login --global
npx github:redasalem/job-hunter-os doctor --global
```

> **Zero-Dependency Core Architecture:** `package.json` maintains strictly **`"dependencies": {}`** and **`"devDependencies": {}`**. The core CLI uses Node.js built-ins only. Optional browser automation and PDF export use pinned Playwright MCP (`@playwright/mcp@0.0.86`) invoked via `npx` only when you use browser-assisted workflows; Notion sync is opt-in and off by default. Alternative OS install scripts: [`scripts/install.sh`](scripts/install.sh) and [`scripts/install.ps1`](scripts/install.ps1).

---

## Product Architecture

```text
                     JOB HUNTER OS
                           |
          +----------------+----------------+
          |                |                |
       Skills             CLI          Integrations
          |                |                |
     48 Markdown     Node.js (0 deps)  AI IDEs / Optional MCP
     (Progressive    audit / proof /   Cursor, Claude Code,
      Disclosure)    eval / pre-submit Antigravity, Codex, etc.
          |
     CV + Job Description
          |
     Human Fact Confirmation & Verification
          |
     ATS Keyword Comparison + Evidence Map + True Gaps
          |
     Human Review (HTML / TXT / Optional PDF)
          |
     [Optional Browser Prep] Live DOM Read-Back Table
          |
     Explicit Job-Specific Human APPROVE (dry_run: true default)
```

- **Markdown-first runtime:** Your existing AI IDE/model reads `AGENTS.md` and `skills/REGISTRY.md`, loading only the exact skill needed for the active step ([`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)).
- **Zero-dependency CLI:** Handles cross-OS scaffolding, IDE skill syncing, deterministic pre-submit checks, offline CV hygiene audits, local dashboard generation, backups, and fixture evaluation (`bin/cli.mjs`).

---

## Technical Proof & Evaluation Scope

Regenerate the proof card locally straight from `package.json`, `skills/skills-manifest.json`, and the deterministic fixture validator:

```bash
npx github:redasalem/job-hunter-os proof
```

![Job Hunter OS Reproducible Proof Card](assets/proof-card.svg)

[![CI Fixture Validator 20/20](https://img.shields.io/badge/CI_Fixture_Validator-20%2F20_Baseline-2ea44f)](evals/README.md)
[![Optional Playwright MCP](https://img.shields.io/badge/Optional_Browser-Playwright_MCP-167d60)](mcp/README.md)
[![agentskills.io Standard](https://img.shields.io/badge/Standard-agentskills.io-2ea44f)](.agents/skills/daily-run/SKILL.md)

> **Honest Eval Scope:** `eval --baseline` and `proof` perform **deterministic fixture & schema validation** against immutable [`evals/fixtures/ground-truth.json`](evals/fixtures/ground-truth.json)—they are **not** an independent live-model accuracy benchmark. External model runs are stored separately (e.g., [`evals/results/live-agent-eval-run.json`](evals/results/live-agent-eval-run.json)) and graded with `eval --file <json>`. Reproduce on any model with [`evals/PROMPT.md`](evals/PROMPT.md).

<details>
<summary><strong>Inspect all 20 deterministic safety & workflow assertions (EVAL-01..EVAL-20)</strong></summary>

| Validator Group | Fixtures Checked | Verified Invariants | Status |
|---|---|---|---|
| **Anti-Hallucination & ATS Tailoring** (`EVAL-01, 04..07`) | [`candidate-profile.md`](evals/fixtures/candidate-profile.md), [`ground-truth.json`](evals/fixtures/ground-truth.json), [`01-strong-match.md`](evals/fixtures/jds/01-strong-match.md) | `0` invented metrics, `Kubernetes` isolated in `true_gaps`, `0` banned AI clichés/em-dashes, 1-page A4 budget (`<= 38` lines) | **5 / 5 PASS** |
| **Prompt-Injection & Honeypot Defense** (`EVAL-03, 08, 17`) | [`02-prompt-injection-trap.md`](evals/fixtures/jds/02-prompt-injection-trap.md), [`01-strong-match.md`](evals/fixtures/jds/01-strong-match.md) | Quarantines hidden `SYSTEM OVERRIDE` (`0` leaked files, salary floor untampered), leaves `website_url_honeypot` blank, captures `PINEAPPLE` codeword | **3 / 3 PASS** |
| **Ghost, Blacklist & Cross-Channel Dedup** (`EVAL-02, 09..12`) | [`03-ghost-expired-job.md`](evals/fixtures/jds/03-ghost-expired-job.md), [`04-blacklist-duplicate.md`](evals/fixtures/jds/04-blacklist-duplicate.md), [`05-stretch-mismatch.md`](evals/fixtures/jds/05-stretch-mismatch.md) | Skips `>90d` closed jobs, blocks `blacklisted_companies`/`blacklisted_domains`, deduplicates `acme-cloud::senior-backend-engineer` | **5 / 5 PASS** |
| **ATS Form Mocks, DOM Read-Back & Anti-Ban** (`EVAL-13..16, 18..20`) | [`greenhouse-mock.html`](evals/fixtures/forms/greenhouse-mock.html), [`lever-mock.html`](evals/fixtures/forms/lever-mock.html), [`ashby-mock.html`](evals/fixtures/forms/ashby-mock.html) | Upload-First (`resume.pdf`), neutral EEO defaults, `gdpr_consent: true`, Live DOM Read-Back Table before `APPROVE`, and 24h circuit-breaker cooldown | **7 / 7 PASS** |

</details>

### ATS & Platform Verification Matrix

| Support Tier | Platforms / ATS Engines | Verification Evidence |
|---|---|---|
| **Fixture-Verified** | **Greenhouse**, **Lever**, **Ashby** | Self-contained HTML form fixtures ([`evals/fixtures/forms/`](evals/fixtures/forms/greenhouse-mock.html)) covering file upload, honeypots, EEO/GDPR & DOM read-back |
| **Playbook-Ready / Field-Testing** | **Workday** *(manual fallback)*, **SmartRecruiters**, **BreezyHR**, **LinkedIn Jobs**, **Wellfound** | Markdown playbooks with `<60d` `last_verified` checks in `doctor` and read-only LinkedIn extraction |
| **Help Wanted** | **Regional Job Boards** (GulfTalent, Naukri, StepStone, TokyoDev, LATAM boards) | Open community playbooks — see [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`PLATFORMS.md`](PLATFORMS.md) |

---

## Integrations, Compatibility & Secondary Tools

- **AI IDEs & CLI Harnesses (25+ documented):** Antigravity, Claude Code, Claude Desktop, Cursor, Windsurf / Devin Desktop, Codex CLI, Gemini CLI, OpenCode, Kilo Code, Cline, Roo Code, GitHub Copilot, JetBrains Junie / AI Assistant, AWS Kiro, Amazon Q, Trae, Zed, Goose, Amp, Aider, Continue, OpenHands, Warp, Augment, Crush, and Web Chat fallback. Full setup matrix and 6 model tuning guides in [`docs/COMPATIBILITY.md`](docs/COMPATIBILITY.md).
- **Secondary Capability — Local Application Tracking Dashboard:** Inspect your local `logs/applications-log.json` in a zero-server Kanban & channel-yield viewer (`job-hunter dashboard`). Preview the secondary UI with clearly labeled synthetic records at **[Application Tracking Dashboard Demo ↗](https://redasalem.github.io/job-hunter-os/demo-dashboard.html)**.
- **Optional External MCP Plugins:** [`mcp/mcp.template.json`](mcp/mcp.template.json) and [`docs/OPTIONAL_MCP_PLUGINS.md`](docs/OPTIONAL_MCP_PLUGINS.md).

---

## Full Skill Catalog & CLI Reference

### Core Slash Commands

| Command | Workflow | Purpose |
|---|---|---|
| `/demo` | [`.agent/workflows/demo.md`](.agent/workflows/demo.md) | Instant sandbox with 3 synthetic JDs + automatic Job #1 tailored preview |
| `/quick-tailor` | [`.agent/workflows/quick-tailor.md`](.agent/workflows/quick-tailor.md) | Fact-checked HTML/TXT CV tailoring from 1 CV + 1 JD (no browser login) |
| `/setup` | [`.agent/workflows/setup.md`](.agent/workflows/setup.md) | Optional full Career OS onboarding (5 readiness gates + live URL checks) |
| `/daily-run` | [`.agent/workflows/daily-run.md`](.agent/workflows/daily-run.md) | Multi-platform discovery, triage, tailoring & `APPROVE`-gated ATS prep |
| `/apply-url URL` | [`.agent/workflows/apply-url.md`](.agent/workflows/apply-url.md) | Score, tailor, and safely gate a single HTTPS job URL |
| `/tailor-cv URL` | [`.agent/workflows/tailor-cv.md`](.agent/workflows/tailor-cv.md) | Tailored CV + ATS heatmap + `interview-dossier.md` (never submits) |
| `/linkedin-growth` | [`.agent/workflows/linkedin-growth.md`](.agent/workflows/linkedin-growth.md) | Read-only `0–100` Recruiter-SEO audit & copy drafts (`DRAFT_ONLY`, zero browser mutations) |
| `/weekly-report` | [`.agent/workflows/weekly-report.md`](.agent/workflows/weekly-report.md) | Local funnel, rejection pattern, and score calibration insights |

### CLI Commands (`bin/cli.mjs`)

`audit <cv.md|txt> [--share]` · `init [--global] [--force] [--ide <name>]` · `proof` · `eval [--baseline | --file <json>]` · `pre-submit [--draft <f> | --text <t>]` · `doctor [--strict]` · `status` · `dashboard [--no-open]` · `bundle` · `login` · `unlock` · `backup` · `sync-mcp` · `update`

### Documentation Index

- [**`AGENTS.md`**](AGENTS.md) & [**`skills/REGISTRY.md`**](skills/REGISTRY.md) — Canonical rules, progressive disclosure index (**48 registered skills**), and 10 guardrails
- [**`docs/SKILL_CATALOG.md`**](docs/SKILL_CATALOG.md) & [**`docs/ARCHITECTURE.md`**](docs/ARCHITECTURE.md) — Complete catalog (`30` core, `4` meta, `7` platform, `7` ATS) and 6-phase pipeline
- [**`docs/execution-safety.md`**](docs/execution-safety.md) & [**`SECURITY.md`**](SECURITY.md) — Deterministic CLI vs. agent workflow controls, privacy boundaries, and signing policy
- [**`HIRED.md`**](HIRED.md) & [**`CHANGELOG.md`**](CHANGELOG.md) — Authentic community outcomes ledger (separated from maintainer origin) & release history

---

## Contributing

Contributions are welcome across Markdown playbooks, synthetic ATS fixtures, IDE integrations, and zero-dependency CLI improvements. Three high-impact ways to start (full details, required evidence, and acceptance criteria in [`CONTRIBUTING.md`](CONTRIBUTING.md)):

1. **Add or improve an ATS synthetic fixture** (`evals/fixtures/forms/` + `evals/RUBRIC.md`).
2. **Verify or improve a regional job-board playbook** (`skills/platforms/` + `PLATFORMS.md`).
3. **Validate an AI IDE integration** (`docs/COMPATIBILITY.md` + IDE entrypoint files).

- Report broken ATS/board layouts via [**Playbook Broke**](.github/ISSUE_TEMPLATE/playbook-broke.md).
- Share an authentic job search outcome (`interview` / `contract` / `offer`, anonymous welcome) via [**Share a Job Search Outcome**](https://github.com/redasalem/job-hunter-os/issues/new?template=share-success.yml).

---

## License & Attribution

Inspired by open-source patterns from **[`career-ops-hq/career-ops`](https://github.com/career-ops-hq/career-ops)**, **[`obra/superpowers`](https://github.com/obra/superpowers)**, and **[`anthropics/skills`](https://github.com/anthropics/skills)** / **[`agentskills.io`](https://agentskills.io/)**.

Licensed under the [MIT License](LICENSE) — Copyright (c) 2026 Reda Salem (`@redasalem`). See [`NOTICE`](NOTICE) and [`AUTHORS.md`](AUTHORS.md).
