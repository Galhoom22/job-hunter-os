# job-hunter-os

**Your AI Career Operating System. Tailor Every CV. Verify Every Claim. Stay in Control.**

**Runs inside your existing AI IDE (Claude Code, Cursor, Windsurf, Cline, Gemini CLI, Codex) using your active subscription — zero external API keys required.**

An open-source, local-first AI career operations framework built around one principle: **AI can prepare your job applications, but it must never invent your experience or take control away from you.** Built on 3 core engines (**Fact-Checked CV Diffs**, **Recruiter-SEO Audits**, and **Human `APPROVE` Gates**) backed by a modular library of 48 pure-Markdown skills loaded only on demand, plus a zero-dependency Node.js CLI (`dependencies: {}`).

**English | [العربية (RTL)](README.ar.md)** · **[Try the Interactive Dashboard Demo ↗](https://redasalem.github.io/job-hunter-os/demo-dashboard.html)** · **[Share an Outcome](https://github.com/redasalem/job-hunter-os/issues/new?template=share-success.yml)**

[![Zero Core Dependencies](https://img.shields.io/badge/Core_CLI-0_NPM_Dependencies-2ea44f)](package.json)
[![48 Agent Skills](https://img.shields.io/badge/Skills-48_Pure_Markdown-167d60)](skills/REGISTRY.md)
[![MIT License](https://img.shields.io/badge/License-MIT-2ea44f)](LICENSE)

### What It Actually Does (Before vs. After `APPROVE` Gate)

```diff
- Built backend APIs for an e-commerce app using Node.js.
+ Engineered idempotent Node.js/TypeScript webhook processors handling $4.2M daily volume (-38% p95 latency) [verified: context/profile.md].
! Blocked claim: "Managed multi-cluster Kubernetes" (0 years in verified profile — moved to True Gaps)
[Status: Awaiting human APPROVE]
```

- **Zero fabricated experience:** Every tailored bullet maps back to verified facts; missing skills are isolated under **True Gaps**.
- **Zero blind submissions:** `dry_run: true` by default; live forms pause at a **Live DOM Read-Back Table** requiring explicit job-bound `APPROVE`.
- **100% local-first:** Your CV, logs, and browser profile stay on your machine (zero telemetry, zero SaaS lock-in).

![Job Hunter OS — 3-Step Safe-Wedge Workflow: /quick-tailor -> Mission Control -> dashboard.html](assets/demo-preview.png)

---

## What Goes In → What Comes Out

| You Provide (Input) | Job Hunter OS (Trust Boundary) | You Receive (Output) |
|---|---|---|
| Existing CV + confirmed facts | **Fact-Check** against verified profile | Single-column tailored CV (**HTML + TXT**, optional PDF) |
| Target job description(s) | **Match & Defend** (ghost/scam/prompt-injection guard) | **ATS Keyword Heatmap** (`Before % → After %`) + explicit **True Gaps** |
| Optional browser session | **Verify & Gate** (Live DOM Read-Back + `APPROVE`) | **Interview Dossier**, `<= 75`-word draft outreach, local Kanban board |

---

## Choose Your Starting Path (No Setup Tax)

| Path | Best For | Requirements | First Output |
|---|---|---|---|
| **1. Instant Sandbox (`/demo`)** | Trying the workflow in 15 seconds | Zero personal data, zero browser login | Mission Control table + **automatic complete tailored preview** (Job #1) |
| **2. Fast-Start (`/quick-tailor`)** | Getting your first real tailored CV in <2 min | Paste your CV + 1 JD (**no browser login or full setup**) | Confirmed fact sheet + tailored HTML/TXT CV + ATS heatmap + True Gaps |
| **3. Full Career OS (`/setup` → `/daily-run`)** | Ongoing multi-platform job search | CLI `init` + `login` + 5 readiness gates | Discovery, scoring, tailoring, interview dossiers & human-approved ATS prep |

### Try `/demo` or `/quick-tailor` Now (Zero Browser Setup)

Open this repo in **Cursor, Claude Code, Antigravity, VS Code Copilot, Codex CLI, OpenCode, or Windsurf** and type:

- **`/demo`** ([`.agent/workflows/demo.md`](.agent/workflows/demo.md)) — Loads a synthetic profile and 5 edge-case JDs, renders the Mission Control table, and **immediately displays a full tailored CV + ATS comparison + draft outreach example** with zero personal data.
- **`/quick-tailor`** ([`.agent/workflows/quick-tailor.md`](.agent/workflows/quick-tailor.md)) — Paste your real CV and one JD, confirm your extracted facts, and immediately receive a fact-checked tailored HTML/TXT resume without configuring browser login, targets, or Playwright MCP.

---

## 30-Second Local Installation (`macOS`, `Linux`, `Windows`)

```bash
# 1. Instant offline hygiene & cliché audit on your own resume (zero setup, PII-stripped --share option)
npx github:redasalem/job-hunter-os audit ./resume.md --share

# 2. Install globally (~/.job-hunter-os + IDE auto-discovery skills & MCP config) & generate Proof Card
npx github:redasalem/job-hunter-os init --global
npx github:redasalem/job-hunter-os proof

# 3. Optional (Full Career OS only): sign in once to your local browser-profile/ & run doctor
npx github:redasalem/job-hunter-os login --global
npx github:redasalem/job-hunter-os doctor
```

> **Dependency Transparency:** The core CLI (`bin/cli.mjs`) has **strictly zero npm runtime or dev dependencies** (`dependencies: {}`, `devDependencies: {}`). Browser automation and PDF export are **optional** and run locally via pinned Playwright MCP (`@playwright/mcp@0.0.86`) invoked through `npx` only when you use browser workflows.

- **All CLI Commands:** `audit <cv.md|txt> [--share]` · `init [--global] [--force] [--ide <name>]` · `proof` · `eval [--baseline | --file <json>]` · `pre-submit [--draft <f> | --text <t>]` · `doctor [--strict]` · `status` · `dashboard [--no-open]` · `bundle` · `login` · `unlock` · `backup` · `sync-mcp` · `update` (plus [`scripts/install.sh`](scripts/install.sh) and [`scripts/install.ps1`](scripts/install.ps1)).

---

## Reproducible Technical Proof (`job-hunter proof`)

Run `npx github:redasalem/job-hunter-os proof` locally to regenerate `logs/exports/proof-card.svg` and `logs/exports/proof-card.md` straight from `package.json`, `skills/skills-manifest.json`, and the deterministic fixture validator:

![Job Hunter OS Reproducible Proof Card](assets/proof-card.svg)

[![Deterministic Harness 20/20](https://img.shields.io/badge/CI_Fixture_Validator-20%2F20_Baseline-2ea44f)](evals/README.md)
[![Playwright MCP](https://img.shields.io/badge/Optional_Browser-Playwright_MCP-167d60)](mcp/README.md)
[![Multi-IDE ready](https://img.shields.io/badge/IDE-25%2B_AI_Apps_%26_Harnesses-167d60)](docs/COMPATIBILITY.md)
[![agentskills.io](https://img.shields.io/badge/Standard-agentskills.io-2ea44f)](.agents/skills/daily-run/SKILL.md)

> **Honest Eval Scope:** `eval --baseline` and `proof` perform **deterministic fixture & schema validation** against immutable [`evals/fixtures/ground-truth.json`](evals/fixtures/ground-truth.json)—they are **not** an independent LLM accuracy benchmark. External model runs are stored separately (e.g., [`evals/results/live-agent-eval-run.json`](evals/results/live-agent-eval-run.json)) and graded with `--file`. Reproduce on any model with [`evals/PROMPT.md`](evals/PROMPT.md).

### Verified Evaluation Runs

| Run Type | Command / Artifact | Scope | Score |
|---|---|---|---|
| **CI Harness Self-Test** | `node ./bin/cli.mjs eval --baseline` ([`baseline-verified-run.json`](evals/results/baseline-verified-run.json)) | Static fixture, regex, and schema regression check (Linux/macOS/Windows) | **20 / 20 PASS** |
| **Live Agent Session Run** | `node ./bin/cli.mjs eval --file evals/results/live-agent-eval-run.json` | Live Gemini session running [`evals/PROMPT.md`](evals/PROMPT.md) against 5 JDs & 3 ATS mocks | **20 / 20 PASS** |

<details>
<summary><strong>Inspect all 20 deterministic safety & workflow assertions (EVAL-01..EVAL-20)</strong></summary>

| Validator Group | Fixtures Checked | Verified Invariants | Status |
|---|---|---|---|
| **Anti-Hallucination & ATS Tailoring** (`EVAL-01, 04..07`) | [`candidate-profile.md`](evals/fixtures/candidate-profile.md), [`ground-truth.json`](evals/fixtures/ground-truth.json), [`01-strong-match.md`](evals/fixtures/jds/01-strong-match.md) | `0` invented metrics, `Kubernetes` isolated in `true_gaps`, `0` banned AI clichés/em-dashes, 1-page A4 budget (`<= 38` lines) | **5 / 5 PASS** |
| **Prompt-Injection & Honeypot Defense** (`EVAL-03, 08, 17`) | [`02-prompt-injection-trap.md`](evals/fixtures/jds/02-prompt-injection-trap.md), [`01-strong-match.md`](evals/fixtures/jds/01-strong-match.md) | Quarantines hidden `SYSTEM OVERRIDE` (`0` leaked files, salary floor untampered), leaves `website_url_honeypot` blank, captures `PINEAPPLE` codeword | **3 / 3 PASS** |
| **Ghost, Blacklist & Cross-Channel Dedup** (`EVAL-02, 09..12`) | [`03-ghost-expired-job.md`](evals/fixtures/jds/03-ghost-expired-job.md), [`04-blacklist-duplicate.md`](evals/fixtures/jds/04-blacklist-duplicate.md), [`05-stretch-mismatch.md`](evals/fixtures/jds/05-stretch-mismatch.md) | Skips `>90d` closed jobs, blocks `blacklisted_companies`/`blacklisted_domains`, deduplicates `acme-cloud::senior-backend-engineer` | **5 / 5 PASS** |
| **ATS Form Mocks, DOM Read-Back & Anti-Ban** (`EVAL-13..16, 18..20`) | [`greenhouse-mock.html`](evals/fixtures/forms/greenhouse-mock.html), [`lever-mock.html`](evals/fixtures/forms/lever-mock.html), [`ashby-mock.html`](evals/fixtures/forms/ashby-mock.html) | Upload-First (`resume.pdf`), neutral EEO defaults, `gdpr_consent: true`, Live DOM Read-Back Table before `APPROVE`, and 24h circuit-breaker cooldown | **7 / 7 PASS** |

</details>

### Honest ATS & Platform Support Matrix

| Support Tier | Platforms / ATS Engines | Verification Evidence |
|---|---|---|
| **Fixture-Verified** | **Greenhouse**, **Lever**, **Ashby** | Self-contained HTML form fixtures ([`evals/fixtures/forms/`](evals/fixtures/forms/greenhouse-mock.html)) covering file upload, honeypots, EEO/GDPR & DOM read-back |
| **Playbook-Ready / Field-Testing** | **Workday**, **SmartRecruiters**, **LinkedIn Easy Apply**, **Wellfound** | Full Markdown playbooks with `<60d` `last_verified` checks in `doctor` and 3-tier read-only LinkedIn JSON extraction |
| **Help Wanted** | **Regional Job Boards** (GulfTalent & Bayt MENA, Naukri India, StepStone DACH) | Open `good first issue` / `playbook` issues — community PRs welcome |

---

## Core Slash Commands & Architecture Map

| Slash Command | Workflow | Purpose |
|---|---|---|
| `/demo` | [`.agent/workflows/demo.md`](.agent/workflows/demo.md) | 15-second offline sandbox with Mission Control + automatic Job #1 tailored preview |
| `/quick-tailor` | [`.agent/workflows/quick-tailor.md`](.agent/workflows/quick-tailor.md) | Fast-start CV tailoring from 1 CV + 1 JD (no browser login or full setup) |
| `/setup` | [`.agent/workflows/setup.md`](.agent/workflows/setup.md) | Full Career OS onboarding: 5 readiness gates + live portfolio URL check |
| `/daily-run` | [`.agent/workflows/daily-run.md`](.agent/workflows/daily-run.md) | Gated run: auth → discovery → Mission Control → tailor → DOM read-back → `APPROVE` |
| `/tailor-cv URL` | [`.agent/workflows/tailor-cv.md`](.agent/workflows/tailor-cv.md) | ATS Keyword Heatmap + fact-checked PDF + `interview-dossier.md` (never submits) |
| `/linkedin-growth` | [`.agent/workflows/linkedin-growth.md`](.agent/workflows/linkedin-growth.md) | Read-only `0–100` Recruiter-SEO audit & grounded copy (`DRAFT_ONLY`, zero browser mutations) |
| `/weekly-report` | [`.agent/workflows/weekly-report.md`](.agent/workflows/weekly-report.md) | Funnel conversion, rejection pattern, and score calibration insights |

| Guide | Contents |
|---|---|
| [**`AGENTS.md`**](AGENTS.md) & [**`skills/REGISTRY.md`**](skills/REGISTRY.md) | Canonical rules, Progressive Disclosure index (**48 consolidated skills**), and 10 hard guardrails |
| [**`docs/SKILL_CATALOG.md`**](docs/SKILL_CATALOG.md) & [**`docs/ARCHITECTURE.md`**](docs/ARCHITECTURE.md) | Full catalog (`30` core, `4` meta, `7` platform, `7` ATS) and 6-phase pipeline diagram |
| [**`docs/COMPATIBILITY.md`**](docs/COMPATIBILITY.md) & [**`PLATFORMS.md`**](PLATFORMS.md) | Setup matrix for **25+ AI IDEs & CLI harnesses**, 6 LLM tuning guides, and board coverage |
| [**`mcp/mcp.template.json`**](mcp/mcp.template.json) & [**`docs/OPTIONAL_MCP_PLUGINS.md`**](docs/OPTIONAL_MCP_PLUGINS.md) | Pinned Playwright/Notion MCP setup and opt-in community plugin ToS/rate-limit warnings |
| [**`docs/execution-safety.md`**](docs/execution-safety.md) & [**`config/invariants.txt`**](config/invariants.txt) | Hard `APPROVE` boundary, `3–9 s` human pacing, 24h circuit breaker & `pre-submit` CLI gate |
| [**`HIRED.md`**](HIRED.md) & [**`CHANGELOG.md`**](CHANGELOG.md) | Independent community outcomes (separated from project origin) & release history (`v1.0.0` → `v1.4.1`) |

---

## Community & Contributing

- **Share a job search outcome (30s, anonymous welcome):** Use the [**Share a Job Search Outcome**](https://github.com/redasalem/job-hunter-os/issues/new?template=share-success.yml) form (`interview` / `contract` / `offer`) — no fork required.
- **Contribute a regional playbook or ATS fixture:** Pick an open [`good first issue`](https://github.com/redasalem/job-hunter-os/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or report a changed ATS layout via [**Playbook Broke**](.github/ISSUE_TEMPLATE/playbook-broke.md). See [`CONTRIBUTING.md`](CONTRIBUTING.md).

### Attribution & Upstream Inspirations
Inspired by open-source patterns from **[`career-ops-hq/career-ops`](https://github.com/career-ops-hq/career-ops)** (local job-search ops, rejection lens, `HIRED.md`), **[`obra/superpowers`](https://github.com/obra/superpowers)** (condition-based waiting, verification before completion, TDD for skills), and **[`anthropics/skills`](https://github.com/anthropics/skills)** / **[`agentskills.io`](https://agentskills.io/)** (progressive disclosure and `.agents/skills/*/SKILL.md`).

Licensed under the [MIT License](LICENSE) — Copyright (c) 2026 Reda Salem (`redasalem`).
