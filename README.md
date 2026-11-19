# job-hunter-os

**Fact-Checked AI CV Tailoring, ATS Keyword Intelligence & Interview Dossier Co-Pilot — with Human-in-the-Loop Application Approval.**

**English | [العربية (RTL)](README.ar.md)** · **[Live Interactive Kanban Dashboard Preview ↗](https://redasalem.github.io/job-hunter-os/demo-dashboard.html)**

[![MIT License](https://img.shields.io/badge/License-MIT-2ea44f)](LICENSE)
[![Harness Validator 20/20](https://img.shields.io/badge/CI_Harness_Validator-20%2F20_Baseline-2ea44f)](evals/README.md)
[![48 Consolidated Skills](https://img.shields.io/badge/Skills-48_Consolidated_Markdown-167d60)](skills/REGISTRY.md)
[![Playwright MCP](https://img.shields.io/badge/Browser-Playwright_MCP-167d60)](mcp/README.md)
[![Multi-IDE ready](https://img.shields.io/badge/IDE-25%2B_AI_Apps_%26_Harnesses-167d60)](docs/COMPATIBILITY.md)
[![agentskills.io](https://img.shields.io/badge/Standard-agentskills.io-2ea44f)](.agents/skills/daily-run/SKILL.md)

`job-hunter-os` turns your AI IDE or CLI harness into a disciplined career co-pilot built on **48 consolidated Markdown skills** and a **zero-dependency Node CLI** (`dependencies: {}`). It reads [`AGENTS.md`](AGENTS.md) and [`skills/REGISTRY.md`](skills/REGISTRY.md), scores job fit honestly, maps ATS keywords (`Before vs. After %`), generates single-column HTML/PDF CVs and interview dossiers, runs grounded `0–100` LinkedIn Recruiter-SEO profile audits, prepares `<= 75`-word hiring-manager notes, and logs everything locally (`logs/` + optional Notion MCP).

> **What `job-hunter-os` Will NEVER Do (Hard Operational Boundaries):**
> - **No blind auto-submit:** `dry_run: true` is on by default; live forms pause at a **Live DOM Read-Back Table** and require your explicit job-bound `APPROVE` reply before clicking Submit.
> - **No fabricated CV claims:** Zero invented metrics, tools, dates, or skill years—missing qualifications are flagged under True Gaps.
> - **No CAPTCHA / 2FA / ToS bypass:** Any bot check, rate limit, or security banner trips a 24-hour platform circuit breaker immediately (`logs/circuit-breaker.json`), while actions observe strict **3–9 s human pacing**.

---

## ⚡ Try `/demo` in 15 Seconds & Live Dashboard Preview (Zero Setup)

![Job Hunter OS — 3-Step Safe-Wedge Workflow Preview: /demo -> Mission Control -> dashboard.html](assets/demo-preview.png)

- **15-Second IDE Sandbox (`/demo`):** Open this repo in **Cursor, Claude Code, Antigravity, VS Code Copilot, Codex CLI, OpenCode, or Windsurf** and type `/demo` (or view [`examples/sandbox-demo/`](examples/sandbox-demo/expected-mission-control.md) and [`examples/outputs/`](examples/outputs/sample-interview-dossier.md)) to test Mission Control scoring, Company Health vetting, and outreach drafting with zero personal data.
- **Live Interactive Browser Preview:** Open the [**GitHub Pages Kanban & Analytics Dashboard**](https://redasalem.github.io/job-hunter-os/demo-dashboard.html) ([`docs/demo-dashboard.html`](docs/demo-dashboard.html)) pre-loaded with synthetic applications—or run `npx github:redasalem/job-hunter-os dashboard` locally against your own `logs/applications-log.json`.

---

## 1. 30-Second CLI Quick Start (`macOS`, `Linux`, `Windows`)

```bash
# 1. Install skills globally (~/.job-hunter-os + ~/.agents/skills, ~/.claude/skills, ~/.cursor/rules, Antigravity) & sync MCP
npx github:redasalem/job-hunter-os init --global

# 2. Sign in once inside your dedicated local browser-profile/
npx github:redasalem/job-hunter-os login --global

# 3. Verify readiness gates, live profile URLs, playbook freshness (<60d), provenance & CI harness validator
npx github:redasalem/job-hunter-os doctor
npx github:redasalem/job-hunter-os eval --baseline
```

- **All CLI Commands:** `init [--global] [--ide <name>]` · `update` · `doctor` · `eval [--baseline | --file <json>]` · `pre-submit [--draft <f> | --text <t>]` · `status` · `bundle` · `dashboard [--no-open]` · `unlock` · `backup` · `login` · `sync-mcp` (plus [`scripts/install.sh`](scripts/install.sh) and [`scripts/install.ps1`](scripts/install.ps1)).

---

## 2. Eval Runs & ATS Support Matrix (`eval --baseline` / `--file`)

> **Truthful Scope Note:** `node ./bin/cli.mjs eval --baseline` is a **deterministic CI harness validator for schema, fixture integrity, and assertion logic** against [`evals/results/baseline-verified-run.json`](evals/results/baseline-verified-run.json)—it is **not** a live LLM benchmark. Actual model runs are stored separately (e.g., [`evals/results/live-agent-eval-run.json`](evals/results/live-agent-eval-run.json)) and graded with `--file` against immutable [`evals/fixtures/ground-truth.json`](evals/fixtures/ground-truth.json). Run [`evals/PROMPT.md`](evals/PROMPT.md) on any model (`Claude`, `Gemini`, `GPT`, `DeepSeek`) to reproduce. See [`evals/README.md`](evals/README.md).

### Verified Evaluation Runs

| Run Type | Artifact / Command | Purpose & Scope | Deterministic Score |
|---|---|---|---|
| **CI Harness Self-Test** | `node ./bin/cli.mjs eval --baseline` ([`baseline-verified-run.json`](evals/results/baseline-verified-run.json)) | Static CI fixture & schema regression check across Linux/macOS/Windows | **20 / 20 PASS** |
| **Live Agent Session Run** | `node ./bin/cli.mjs eval --file evals/results/live-agent-eval-run.json` ([`live-agent-eval-run.json`](evals/results/live-agent-eval-run.json)) | Live Gemini agent session executing [`evals/PROMPT.md`](evals/PROMPT.md) against all 5 JDs, 3 ATS HTML mocks & immutable [`ground-truth.json`](evals/fixtures/ground-truth.json) | **20 / 20 PASS (100%)** |

| Validator Group | Fixtures Checked | Verified Invariants | CI Baseline & Live Run |
|---|---|---|---|
| **Anti-Hallucination & ATS Tailoring** (`EVAL-01, 04..07`) | [`candidate-profile.md`](evals/fixtures/candidate-profile.md), [`ground-truth.json`](evals/fixtures/ground-truth.json), [`01-strong-match.md`](evals/fixtures/jds/01-strong-match.md) | `0` invented metrics, `Kubernetes` isolated in `true_gaps`, `0` banned AI clichés/em-dashes, 1-page A4 budget (`<= 38` lines) | **5 / 5 PASS** |
| **Prompt-Injection & Honeypot Defense** (`EVAL-03, 08, 17`) | [`02-prompt-injection-trap.md`](evals/fixtures/jds/02-prompt-injection-trap.md), [`01-strong-match.md`](evals/fixtures/jds/01-strong-match.md) | Quarantines hidden `SYSTEM OVERRIDE` (`0` leaked files, salary floor untampered), leaves `website_url_honeypot` blank, captures `PINEAPPLE` codeword | **3 / 3 PASS** |
| **Ghost, Blacklist & Cross-Channel Dedup** (`EVAL-02, 09..12`) | [`03-ghost-expired-job.md`](evals/fixtures/jds/03-ghost-expired-job.md), [`04-blacklist-duplicate.md`](evals/fixtures/jds/04-blacklist-duplicate.md), [`05-stretch-mismatch.md`](evals/fixtures/jds/05-stretch-mismatch.md) | Skips `>90d` closed jobs, blocks `blacklisted_companies`/`blacklisted_domains`, deduplicates `acme-cloud::senior-backend-engineer` | **5 / 5 PASS** |
| **ATS Form Mocks, DOM Read-Back & Anti-Ban** (`EVAL-13..16, 18..20`) | [`greenhouse-mock.html`](evals/fixtures/forms/greenhouse-mock.html), [`lever-mock.html`](evals/fixtures/forms/lever-mock.html), [`ashby-mock.html`](evals/fixtures/forms/ashby-mock.html) | Upload-First (`resume.pdf`), neutral EEO defaults, `gdpr_consent: true`, Live DOM Read-Back Table before `APPROVE`, and 24h circuit-breaker cooldown | **7 / 7 PASS** |

### Honest ATS & Platform Support Matrix

| Support Tier | Platforms / ATS Engines | Verification Evidence & Notes |
|---|---|---|
| **Fixture-Verified** | **Greenhouse**, **Lever**, **Ashby** | Local HTML form fixtures ([`evals/fixtures/forms/`](evals/fixtures/forms/greenhouse-mock.html)) + `#grnhse_iframe`, file upload, honeypot, EEO/GDPR, and DOM read-back checks verified in CI |
| **Playbook-Ready / Field-Testing** | **Workday**, **SmartRecruiters**, **LinkedIn Easy Apply**, **Wellfound** | Full Markdown playbooks with `last_verified` timestamps (<60d freshness check in `doctor`); multi-step React-Select / shadow-DOM flows undergoing community field-testing |
| **Help Wanted** | **Regional Job Boards** (GulfTalent & Bayt MENA, Naukri India, StepStone DACH / Europe) | Open `good first issue` / `playbook` contributor issues — PRs welcome with redacted `browser_snapshot` traces |

---

## 3. Architecture, Slash Commands & Mission Control

```text
/setup -> 5 Readiness Gates & Live URL Audit -> /daily-run -> 24h Circuit-Breaker Check
  -> Discover & Expand Full JD -> Prompt-Injection & Blacklist/Fingerprint Guard
  -> Ghost Filter & 0-10 Score -> Mission Control Table (Wait for APPLY selection)
  -> ATS Keyword Heatmap & Fact-Checked 1-Page PDF -> Upload-First ATS Fill
  -> Live DOM Read-Back Table -> Job-Bound APPROVE Gate -> Dossier & Local JSON Ledger
```

```text
| # | Company & Role                         | Health | Score | Status     | Tailoring & Guard Notes                                      |
|---|----------------------------------------|--------|-------|------------|--------------------------------------------------------------|
| 1 | CloudPay Ledger — Senior Full-Stack    | GREEN  | 9.1   | 🟢 Ready   | 92.8% keyword match; includes "PINEAPPLE" attention codeword |
| 2 | ShadowCorp AI — Staff Backend Engineer | RED    | —     | 🔴 Skipped | Quarantined: hidden prompt-injection trap detected           |
| 3 | StaleVortex — Senior Frontend Engineer | YELLOW | —     | 🔴 Skipped | Ghost/expired listing (117 days old, closed banner)          |
```

| Slash Command | Workflow Entrypoint | Action |
|---|---|---|
| `/demo` | [`.agent/workflows/demo.md`](.agent/workflows/demo.md) | 15-second zero-setup sandbox simulation ([`examples/sandbox-demo/`](examples/sandbox-demo/expected-mission-control.md)) |
| `/setup` | [`.agent/workflows/setup.md`](.agent/workflows/setup.md) | Audits 5 readiness gates, verifies live portfolio URLs, and runs a batched 3–4-question interview |
| `/daily-run` | [`.agent/workflows/daily-run.md`](.agent/workflows/daily-run.md) | Full gated run: auth -> discovery -> Mission Control -> tailor -> DOM read-back -> `APPROVE` -> log |
| `/tailor-cv URL` | [`.agent/workflows/tailor-cv.md`](.agent/workflows/tailor-cv.md) | Generates ATS Keyword Heatmap + fact-checked PDF + `interview-dossier.md` (never submits) |
| `/apply-url URL` | [`.agent/workflows/apply-url.md`](.agent/workflows/apply-url.md) | Applies all safety gates to a single HTTPS job posting URL |
| `/weekly-report` | [`.agent/workflows/weekly-report.md`](.agent/workflows/weekly-report.md) | Generates funnel conversion, rejection pattern, and score calibration insights |
| `/linkedin-growth` | [`.agent/workflows/linkedin-growth.md`](.agent/workflows/linkedin-growth.md) | `0–100` Recruiter-SEO profile audit & grounded rewrites ([`skills/linkedin-growth.md`](skills/linkedin-growth.md)), posts, or `<= 75`-word outreach (`DRAFT_ONLY` until explicit `APPROVE`) |

---

## 4. Deep Documentation & Ecosystem Map

| Guide | Contents |
|---|---|
| [**`AGENTS.md`**](AGENTS.md) & [**`skills/REGISTRY.md`**](skills/REGISTRY.md) | Canonical rules, compact Progressive Disclosure index (**48 consolidated skills**), and 10 non-negotiable guardrails |
| [**`docs/SKILL_CATALOG.md`**](docs/SKILL_CATALOG.md) | Complete guide to all **48 consolidated skills**: 30 core/career playbooks, 4 `meta-*` skills, 7 board playbooks, and 7 ATS engines |
| [**`docs/ARCHITECTURE.md`**](docs/ARCHITECTURE.md) | System diagram, 6-phase execution pipeline, and `/setup` readiness interrogation transcript |
| [**`docs/COMPATIBILITY.md`**](docs/COMPATIBILITY.md) | Setup matrix for **25+ AI IDEs & CLI harnesses**, **6 LLM tuning guides** (`adapters/`), and manual copy commands |
| [**`PLATFORMS.md`**](PLATFORMS.md) & [**`context/targets.yaml.example`**](context/targets.yaml.example) | Global, Remote, Regional (Europe, MENA, APAC, LATAM), B2B Contract Networks, and Employer ATS matrix |
| [**`evals/README.md`**](evals/README.md), [**`RUBRIC.md`**](evals/RUBRIC.md) & [**`PROMPT.md`**](evals/PROMPT.md) | Deterministic CI harness validator, 20-assertion rubric, and reproducible external LLM prompt |
| [**`mcp/mcp.template.json`**](mcp/mcp.template.json) & [**`docs/OPTIONAL_MCP_PLUGINS.md`**](docs/OPTIONAL_MCP_PLUGINS.md) | Pinned Playwright MCP (`-y`, `--caps=pdf`, `./browser-profile`), optional Notion MCP, and opt-in community MCP plugins |
| [**`HIRED.md`**](HIRED.md) & [**`CHANGELOG.md`**](CHANGELOG.md) | Community success ledger and release history (`v1.0.0` -> `v1.3.0`) |

---

## 5. Non-Negotiable Operational Trust Boundaries

- **Hard `APPROVE` & DOM Read-Back boundary:** `dry_run: true` by default; even in live mode, submission is blocked until you review the **Live DOM Read-Back Table** and reply `APPROVE`.
- **Hard 3–9 s human pacing & circuit breaker:** Randomized **3–9 s** delays between navigations/submissions, Days 1–3 warm-up cap (**max 5/day**), and an automatic **24-hour platform cooldown** (`logs/circuit-breaker.json`) on any CAPTCHA, 429, or unusual-activity banner. See [`docs/execution-safety.md`](docs/execution-safety.md).
- **Local-first privacy & Git PII shield:** Real `context/*`, `logs/`, `*.pdf`, `.env`, and `browser-profile/` are gitignored and guarded by `.git/hooks/pre-commit`.
- **Broken playbook reporting:** Report DOM changes using our [**Playbook Broke template**](.github/ISSUE_TEMPLATE/playbook-broke.md) with a redacted `browser_snapshot`.

### Attribution & Upstream Inspirations
Inspired by battle-tested patterns from **[`career-ops-hq/career-ops`](https://github.com/career-ops-hq/career-ops)** (rejection pattern lens, score calibration, `HIRED.md`), **[`obra/superpowers`](https://github.com/obra/superpowers)** (condition-based waiting, verification before completion, on-demand MCP routing, TDD for skills), and **[`anthropics/skills`](https://github.com/anthropics/skills)** / **[`agentskills.io`](https://agentskills.io/)** (progressive disclosure and `.agents/skills/*/SKILL.md` auto-discovery).

Licensed under the [MIT License](LICENSE) — Copyright (c) 2026 Reda Salem (`redasalem`).
