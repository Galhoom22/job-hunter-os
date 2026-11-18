# job-hunter-os

**100% Zero-Code AI Agent Skills & MCP Playbook System — Your CV, Your AI IDE, Your Browser.**

**English | [العربية (RTL)](README.ar.md)** · **[Live Interactive Kanban Dashboard Preview ↗](https://htmlpreview.github.io/?https://github.com/redasalem/job-hunter-os/blob/main/docs/demo-dashboard.html)**

[![MIT License](https://img.shields.io/badge/License-MIT-2ea44f)](LICENSE)
[![Skill Eval 20/20](https://img.shields.io/badge/Eval_Harness-20%2F20_Passing-2ea44f)](evals/RUBRIC.md)
[![Zero Code](https://img.shields.io/badge/Runtime-Zero_Code_Markdown-167d60)](AGENTS.md)
[![Playwright MCP](https://img.shields.io/badge/Browser-Playwright_MCP-167d60)](mcp/README.md)
[![Multi-IDE ready](https://img.shields.io/badge/IDE-25%2B_AI_Apps_%26_Harnesses-167d60)](docs/COMPATIBILITY.md)
[![agentskills.io](https://img.shields.io/badge/Standard-agentskills.io-2ea44f)](.agents/skills/daily-run/SKILL.md)

There is **no custom application backend, no browser extension, and zero external npm dependencies** (`dependencies: {}`). **The AI model inside your IDE is the runtime engine.** It reads [`AGENTS.md`](AGENTS.md) and [`skills/REGISTRY.md`](skills/REGISTRY.md), interviews you in chat, drives Chrome via **Playwright MCP** using accessibility snapshots, tailors verified single-column HTML/PDF resumes, fills ATS forms behind a human `APPROVE` gate, and logs everything to local JSON (plus optional **Notion MCP**).

---

## 1. 30-Second Quick Start (`macOS`, `Linux`, `Windows`)

```bash
# 1. Install skills globally (~/.job-hunter-os + ~/.agents/skills, ~/.claude/skills, ~/.cursor/rules, Antigravity) & sync MCP
npx job-hunter-os init --global
# (Or direct from GitHub: npx github:redasalem/job-hunter-os init --global)

# 2. Sign in once inside your dedicated local browser-profile/
npx job-hunter-os login --global

# 3. Verify readiness gates, live profile URLs, playbook freshness (<60d), and run the 20-check eval suite
npx job-hunter-os doctor
npx job-hunter-os eval
```

- **Try in 15 seconds with zero setup:** Type `/demo` in your AI IDE (or inspect [`examples/sandbox-demo/`](examples/sandbox-demo/expected-mission-control.md) and [`examples/outputs/`](examples/outputs/sample-interview-dossier.md)).
- **Preview the Analytics & Kanban UI in your browser:** Open the [**Live Demo Dashboard**](https://htmlpreview.github.io/?https://github.com/redasalem/job-hunter-os/blob/main/docs/demo-dashboard.html) ([`docs/demo-dashboard.html`](docs/demo-dashboard.html)) or run `npx job-hunter-os dashboard` locally.
- **All CLI Commands:** `init [--global] [--ide <name>]` · `update` · `doctor` · `eval` · `status` · `bundle` · `dashboard [--no-open]` · `unlock` · `backup` · `login` · `sync-mcp` (plus [`scripts/install.sh`](scripts/install.sh) and [`scripts/install.ps1`](scripts/install.ps1)).

---

## 2. Verified Skill Evaluation Scorecard (`npx job-hunter-os eval`)

Unlike unverified prompt collections, `job-hunter-os` ships a deterministic local evaluation harness under [`evals/`](evals/RUBRIC.md) testing **5 edge-case job descriptions** and **3 local HTML ATS form mocks** (`Greenhouse`, `Lever`, `Ashby`) in CI across Linux, macOS, and Windows:

| Eval Category | Fixtures Under Test | Verified Invariants | Score |
|---|---|---|---|
| **Anti-Hallucination & ATS Tailoring** (`EVAL-01, 04..07`) | [`candidate-profile.md`](evals/fixtures/candidate-profile.md), [`01-strong-match.md`](evals/fixtures/jds/01-strong-match.md) | `0` invented metrics, `0` unverified skills (`Kubernetes` isolated in `true_gaps`), `0` banned AI clichés/em-dashes, 1-page A4 budget (`<= 38` lines) | **5 / 5 PASS** |
| **Prompt-Injection & Honeypot Defense** (`EVAL-03, 08, 17`) | [`02-prompt-injection-trap.md`](evals/fixtures/jds/02-prompt-injection-trap.md), [`01-strong-match.md`](evals/fixtures/jds/01-strong-match.md) | Quarantines hidden `SYSTEM OVERRIDE` (`0` leaked files, salary floor untampered), leaves `website_url_honeypot` blank, captures benign recruiter codeword (`PINEAPPLE`) | **3 / 3 PASS** |
| **Ghost, Blacklist & Cross-Channel Dedup** (`EVAL-02, 09..12`) | [`03-ghost-expired-job.md`](evals/fixtures/jds/03-ghost-expired-job.md), [`04-blacklist-duplicate.md`](evals/fixtures/jds/04-blacklist-duplicate.md), [`05-stretch-mismatch.md`](evals/fixtures/jds/05-stretch-mismatch.md) | Skips `>90d` closed jobs, blocks `blacklisted_companies`/`blacklisted_domains`, deduplicates `acme-cloud::senior-backend-engineer` across boards | **5 / 5 PASS** |
| **ATS Form Mocks, DOM Read-Back & Anti-Ban** (`EVAL-13..16, 18..20`) | [`greenhouse-mock.html`](evals/fixtures/forms/greenhouse-mock.html), [`lever-mock.html`](evals/fixtures/forms/lever-mock.html), [`ashby-mock.html`](evals/fixtures/forms/ashby-mock.html) | Enforces Upload-First (`resume.pdf`), EEO neutral defaults, `gdpr_consent: true`, Live DOM Read-Back Table before `APPROVE`, and 24h circuit-breaker cooldown | **7 / 7 PASS** |
| **Total Verified Assertions** | **5 JDs + 3 ATS Form Mocks + Circuit Breaker** | `node ./bin/cli.mjs eval` (runs on every push in GitHub Actions) | **20 / 20 (100%)** |

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
| `/linkedin-growth` | [`.agent/workflows/linkedin-growth.md`](.agent/workflows/linkedin-growth.md) | Drafts profile improvements or `<= 75`-word outreach (`DRAFT_ONLY` until explicit `approve`) |

---

## 4. Deep Documentation & Ecosystem Map

| Guide | Contents |
|---|---|
| [**`AGENTS.md`**](AGENTS.md) & [**`skills/REGISTRY.md`**](skills/REGISTRY.md) | Canonical rules, Progressive Disclosure index (**47 consolidated skills**), and 10 non-negotiable guardrails |
| [**`docs/SKILL_CATALOG.md`**](docs/SKILL_CATALOG.md) | Complete guide to all 28 core skills (`00–26` + `fallback-no-mcp`), 4 `meta-*` skills, 7 consolidated board playbooks, and 7 ATS engines |
| [**`docs/ARCHITECTURE.md`**](docs/ARCHITECTURE.md) | System diagram, 6-phase execution pipeline, and `/setup` readiness interrogation transcript |
| [**`docs/COMPATIBILITY.md`**](docs/COMPATIBILITY.md) | Setup matrix for **25+ AI IDEs & CLI harnesses**, **6 LLM tuning guides** (`adapters/`), and manual copy commands |
| [**`PLATFORMS.md`**](PLATFORMS.md) & [**`context/targets.yaml.example`**](context/targets.yaml.example) | Global, Remote, Regional (Europe, MENA, APAC, LATAM), B2B Contract Networks, and Employer ATS matrix |
| [**`evals/RUBRIC.md`**](evals/RUBRIC.md) | 20-assertion deterministic evaluation rubric, synthetic JDs, and local HTML ATS form mocks |
| [**`mcp/mcp.template.json`**](mcp/mcp.template.json) | Portable Playwright MCP (`./browser-profile`) and optional Notion MCP configuration |
| [**`HIRED.md`**](HIRED.md) & [**`CHANGELOG.md`**](CHANGELOG.md) | Community success ledger and release history (`v1.0.0` -> `v1.2.0`) |

---

## 5. Non-Negotiable Safety Invariants & Governance

- **Dry run by default (`dry_run: true`):** Never clicks final Submit until you enable live mode and reply `APPROVE` after inspecting the **Live DOM Read-Back Table**.
- **Zero hallucinated facts:** Every metric, tool, date, and legal answer must exist in `context/`. Unknown form questions pause with a screenshot and ask you in chat.
- **Anti-bot circuit breaker & human pacing:** Random **3–9 s** action delays, Days 1–3 warm-up cap (**max 5/day**), and an automatic **24-hour platform lock** (`logs/circuit-breaker.json`) on any CAPTCHA, 429, or unusual-activity banner.
- **Local-first privacy & Git PII shield:** Real `context/*`, `logs/`, `*.pdf`, `.env`, and `browser-profile/` are gitignored and guarded by an automatic `.git/hooks/pre-commit` PII & token scanner.
- **Broken playbook reporting:** When a job board changes its DOM, open an issue using our [**Playbook Broke template**](.github/ISSUE_TEMPLATE/playbook-broke.md) with a redacted `browser_snapshot`.

### Attribution & Upstream Inspirations
Inspired by battle-tested patterns from **[`career-ops-hq/career-ops`](https://github.com/career-ops-hq/career-ops)** (rejection pattern lens, score calibration, `HIRED.md`), **[`obra/superpowers`](https://github.com/obra/superpowers)** (condition-based waiting, verification before completion, on-demand MCP routing, TDD for skills), and **[`anthropics/skills`](https://github.com/anthropics/skills)** / **[`agentskills.io`](https://agentskills.io/)** (progressive disclosure and `.agents/skills/*/SKILL.md` auto-discovery).

Licensed under the [MIT License](LICENSE) — Copyright (c) 2026 Reda Salem (`redasalem`).
