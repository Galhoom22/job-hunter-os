# job-hunter-os

**100% Pure Zero-Code AI Agent Skills & MCP Playbook Repository — Your CV, Your AI IDE, Your Browser.**

[![MIT License](https://img.shields.io/badge/License-MIT-2ea44f)](LICENSE)
[![Zero Code](https://img.shields.io/badge/Runtime-Zero_Code_Markdown-167d60)](AGENTS.md)
[![Playwright MCP](https://img.shields.io/badge/Browser-Playwright_MCP-167d60)](mcp/README.md)
[![Notion MCP optional](https://img.shields.io/badge/Tracking-Notion_MCP_optional-356ac3)](mcp/mcp.template.json)
[![Multi-IDE ready](https://img.shields.io/badge/IDE-Antigravity_%7C_Cursor_%7C_Claude_%7C_Windsurf_%7C_Cline-167d60)](docs/chat-commands.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

There is **no custom CLI, no Node/Python automation script, no browser extension, and no backend server** executing your job search. **The AI model inside your IDE is the runtime engine.** It reads [`AGENTS.md`](AGENTS.md) and [`skills/REGISTRY.md`](skills/REGISTRY.md), interviews you in chat, drives Chrome via **Playwright MCP** using accessibility snapshots, tailors HTML/PDF resumes, fills forms safely, and logs everything to local JSON (plus optional **Notion MCP**).

---

## 1. How to Install (Zero Coding or `npm install` Needed!)

### Option A — Project Mode (Recommended)
Clone the repo and open the folder directly in **Antigravity, Cursor, Claude Code, Windsurf, or Cline**:

```bash
git clone https://github.com/redasalem/job-hunter-os.git
cd job-hunter-os
```

Open `job-hunter-os/` in your IDE, connect Playwright MCP (below), and type `/setup` (or *"Read AGENTS.md and set up my profile"*).

### Option B — Global Skills Mode (Use Across Any Workspace)
Copy `skills/` and `.agent/workflows/` (or `commands/`) straight into your IDE's global configuration folder—zero packages or installers required:

**macOS / Linux / Git Bash:**
```bash
# Antigravity global workflows + skills
mkdir -p ~/.antigravity/workflows ~/.antigravity/skills
cp -r .agent/workflows/* ~/.antigravity/workflows/
cp -r skills/* ~/.antigravity/skills/

# Claude Code global commands + skills
mkdir -p ~/.claude/commands ~/.claude/skills
cp -r commands/* ~/.claude/commands/
cp -r skills/* ~/.claude/skills/

# Cursor global rules
mkdir -p ~/.cursor/rules
cp .cursor/rules/job-hunter.mdc ~/.cursor/rules/
```

**Windows (CMD / PowerShell):**
```powershell
# Antigravity global workflows + skills
xcopy /E /I /Y .agent\workflows %USERPROFILE%\.antigravity\workflows
xcopy /E /I /Y skills %USERPROFILE%\.antigravity\skills

# Claude Code global commands + skills
xcopy /E /I /Y commands %USERPROFILE%\.claude\commands
xcopy /E /I /Y skills %USERPROFILE%\.claude\skills

# Cursor global rules
mkdir %USERPROFILE%\.cursor\rules 2>nul
copy /Y .cursor\rules\job-hunter.mdc %USERPROFILE%\.cursor\rules\job-hunter.mdc
```

---

## 2. How to Connect MCP

Paste the exact configuration from [`mcp/mcp.template.json`](mcp/mcp.template.json) into your IDE's MCP settings (`~/.claude.json`, `.cursor/mcp.json`, `~/.gemini/antigravity/mcp_config.json`, or Windsurf/Cline MCP settings):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--user-data-dir=./browser-profile"]
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_TOKEN}"
      }
    }
  }
}
```

- **Playwright MCP** runs Chromium with a persistent private `./browser-profile` directory so you log in manually once (never share passwords or cookies in chat).
- **Notion MCP** is completely optional (`storage_adapters.notion_mcp: false` by default in `config/guardrails.yaml`). Local JSON files under `logs/` are always the primary source of truth.

---

## 3. Modular `agent_skills` Architecture & Progressive Disclosure

To keep the AI model fast and prevent blowing up the context window with 35+ playbooks at once, every skill follows the **`agent_skills` / `SKILL.md` standard** with strict YAML frontmatter (`name`, `version`, `description`, `triggers`, `requires_mcp`, `preconditions`, `requires_skills`, `verification`) and three mandatory body sections (`When to Use & Preconditions`, `Deterministic Step-by-Step Execution`, `Anti-Patterns & Self-Verification Check`):

1. **Progressive Disclosure ([`skills/REGISTRY.md`](skills/REGISTRY.md) & [`skills/skills-manifest.json`](skills/skills-manifest.json)):** At the start of a session, the AI reads `AGENTS.md` and `skills/REGISTRY.md` only. It loads a specific skill's full Markdown playbook **only** when its trigger matches the active step.
2. **Seven Core Numbered Playbooks:**
   - [`skills/00-daily-run.md`](skills/00-daily-run.md) — End-to-end orchestrator for `/daily-run` and `/apply-url`.
   - [`skills/00-interrogate-and-onboard.md`](skills/00-interrogate-and-onboard.md) — **Pure-Chat Readiness Gatekeeper**: inspects `context/` directly, halts on placeholders/missing data, interviews you 3–4 questions at a time, and saves answers.
   - [`skills/01-resume-ingestion.md`](skills/01-resume-ingestion.md) — **Pure-AI CV Ingestion**: reads pasted text, Markdown, or local PDFs via Playwright MCP (`file:///`), confirms facts, and warns if a PDF is scanned/unreadable.
   - [`skills/02-discover-and-triage.md`](skills/02-discover-and-triage.md) — **Batch Discovery, Ghost-Job Filter & Mission Control Table**: builds URLs from `context/targets.yaml`, checks `datePosted` / closed banners / ATS status (`reason: "ghost_or_expired"`), scores `0–10`, and waits for `APPLY ALL GREEN` or `APPLY 1,3`.
   - [`skills/03-tailor-resume-and-verify.md`](skills/03-tailor-resume-and-verify.md) — **Pure-AI Tailoring, Anti-Hallucination Fact-Check & Anti-AI Slop Filter**: updates [`templates/ats-resume-template.html`](templates/ats-resume-template.html), blocks any invented metric/company/tool, strips AI clichés (`delve`, `spearheaded`, `tapestry`, `moreover`, em-dash overuse), and prints PDF via Playwright MCP.
   - [`skills/04-fill-and-apply.md`](skills/04-fill-and-apply.md) — **Upload-First Form Filling, EEO/GDPR Defaults & Approval Gate**: uploads PDF first, waits 4 s, handles hidden dropzones & autocomplete, applies `eeo_and_compliance_defaults` (`Decline to self-identify`, `gdpr_privacy_consent: true`), pauses on unknown questions, and requires exact `APPROVE` before Submit.
   - [`skills/05-outreach-and-interview-prep.md`](skills/05-outreach-and-interview-prep.md) — **Outreach, Cold Email & Interview Dossier**: saves `interview-dossier.md` (archived full JD + top 5 prep questions), `<= 75`-word draft-only `outreach-draft.md` for `Score >= 8`, and `email-draft.md` for email-apply posts.
   - [`skills/06-log-and-insights.md`](skills/06-log-and-insights.md) — **Local JSON + Optional Notion Sync & Weekly Reports**: maintains `logs/applications-log.json`, `logs/skipped-jobs.json`, `logs/runs/YYYY-MM-DD.json`, and `/weekly-report` skill-gap analysis.
3. **Four Agent Reliability Meta-Skills:**
   - [`skills/meta-self-verification.md`](skills/meta-self-verification.md) — Forbids reporting `"applied"` or `"updated"` without a fresh post-click `browser_snapshot` receipt quote.
   - [`skills/meta-dom-recovery.md`](skills/meta-dom-recovery.md) — Recovers from stale refs after modal transitions, iframes, overlays, and lazy-loaded job lists.
   - [`skills/meta-context-compaction.md`](skills/meta-context-compaction.md) — Checkpoints long runs to `logs/runs/current-session-checkpoint.json` every 3–5 applications.
   - [`skills/meta-structured-debugging.md`](skills/meta-structured-debugging.md) — Diagnoses inline form validation errors from the accessibility tree and repairs only with verified facts.

---

## 4. How the AI Executes Everything Step-by-Step

### System Architecture & Lifecycle

```text
USER CHAT: /setup | /daily-run | /apply-url URL | /tailor-cv URL | /weekly-report | /linkedin-growth
                               |
                               v
+--------------------------------------------------------------------+
| AI IDE + Model (Antigravity / Cursor / Claude / Windsurf / Cline)  |
| Reads AGENTS.md + skills/REGISTRY.md (Progressive Disclosure)      |
+-------------------------------+------------------------------------+
                                |
          +---------------------v---------------------+
          | 00-interrogate-and-onboard (5 Gates)      |
          | Audits context/ -> 3-4 Q interview -> Go  |
          +---------------------+---------------------+
                                |
             +------------------+------------------+
             v                                     v
+-----------------------------+      +-------------------------------+
| Playwright MCP              |      | Local Files (Primary Truth)   |
| ./browser-profile (private) |----->| context/  + templates/        |
| snapshots / refs / uploads  |      | logs/applications-log.json    |
+-----------------------------+      | logs/resumes/<company-role>/  |
                                     +---------------+---------------+
                                                     | (opt-in)
                                                     v
                                      +-------------------------------+
                                      | Notion MCP                    |
                                      | Applications / Runs / Insights|
                                      +-------------------------------+
```

```text
Phase 0  READ context/ -> missing or .example placeholders?
         +-- YES -> HARD BLOCK -> 3-4 questions in chat -> save to context/
         +-- NO  -> Mission Briefing -> wait for explicit launch confirmation

Phase 1  AUTH CHECK on enabled targets via Playwright MCP (3-9 s pacing)

Phase 2  CONSTRUCT URL from context/targets.yaml -> browser_navigate
         -> click "See more" -> ghost-job check (>30d / closed -> skipped-jobs.json)
         -> honest 0-10 score -> Tier A (8-10) / Tier B (5-<8) / Tier C (<5)
         -> show Mission Control Table in chat -> WAIT for "APPLY ALL GREEN" / "APPLY 1,3"

Phase 3  TAILOR templates/ats-resume-template.html -> Fact-Check Guard (0 hallucinations)
         -> Humanizer Filter (0 AI slop) -> print PDF via Playwright MCP

Phase 4  UPLOAD PDF FIRST -> wait 4 s -> fresh snapshot -> fill verified answers + EEO/GDPR
         -> unknown question? screenshot + pause + ask user + save to form-answers.yaml
         -> dry_run stops before Submit | live waits for exact "APPROVE"
         -> reserve needs_review -> Submit ONCE -> verify receipt (meta-self-verification)

Phase 5  SAVE interview-dossier.md + outreach-draft.md (<=75w) / email-draft.md
         -> update logs/applications-log.json + logs/runs/YYYY-MM-DD.json + optional Notion
```

---

## 5. Readiness Interrogation Example in Chat

> **Developer:** `/daily-run`
>
> **Agent:** Applications are blocked until all 5 gates are verified:
> - ❌ Gate 1 (CV & Profile): `context/profile.md` still has `.example` placeholders.
> - ❌ Gate 2 (Targets): `context/preferences.yaml` missing target roles/regions.
> - ❌ Gate 3 (Legal & Comp): `context/form-answers.yaml` has `owner_verified: false`.
> - ❌ Gate 4 (Skills Matrix): Core skill years unconfirmed.
> - ❌ Gate 5 (Platforms): No enabled targets in `context/targets.yaml`.
>
> First 4 questions: (1) Paste your CV or drop `assets/resume.pdf`. (2) What target roles & seniority? (3) Remote/Hybrid/Onsite, allowed regions, and timezone? (4) Any blacklisted companies?
>
> **Developer:** *[Shares CV]* Mid-level Frontend Engineer, Remote accepting Egypt (UTC+2), no blacklist.
>
> **Agent:** Extracted and saved your CV facts for confirmation. Next 4 questions: (1) Minimum salary, currency, and monthly/annual basis? (2) Notice period / earliest start date? (3) Work authorization & visa sponsorship needs? (4) Exact hands-on years for React, TypeScript, and Next.js?
>
> **Developer:** USD 2,500 gross/month, 30 days notice, Egypt authorized / sponsorship needed elsewhere, React 4, TypeScript 3, Next.js 2.
>
> **Agent:** Saved to `context/`. Final check: which platforms in `context/targets.yaml` should I enable and open in Playwright MCP for your manual login?
>
> **Developer:** LinkedIn and Wuzzuf; I'm logged in now.
>
> **Agent:** All 5 gates ✅. Mission Briefing: Frontend Engineer (Remote/Egypt), LinkedIn + Wuzzuf, warm-up cap 5/day, min score 7, **dry_run: ON**. Confirm to launch?

---

## 6. URL Construction Table (`context/targets.yaml`) & Platform Playbooks

Read [`context/targets.yaml.example`](context/targets.yaml.example) for the complete registry of preconfigured URL templates (all shipped `enabled: false`). Replace `{{ROLE_ENCODED}}` / `{{LOCATION_ENCODED}}` with single `encodeURIComponent(...)` values:

| Platform | Category | URL Template Pattern | Playbook |
|---|---|---|---|
| LinkedIn Jobs | Global | `https://www.linkedin.com/jobs/search/?keywords={{ROLE_ENCODED}}&f_WT=2&f_TPR=r86400` | [linkedin.md](skills/platforms/linkedin.md) |
| Wellfound | Global | `https://wellfound.com/role/r/{{ROLE_SLUG}}` | [wellfound.md](skills/platforms/wellfound.md) |
| Indeed | Global | `https://www.indeed.com/jobs?q={{ROLE_ENCODED}}&l=Remote&fromage=1` | [indeed.md](skills/platforms/indeed.md) |
| Glassdoor | Global | `https://www.glassdoor.com/Job/jobs.htm?sc.keyword={{ROLE_ENCODED}}` | [glassdoor.md](skills/platforms/glassdoor.md) |
| WeWorkRemotely | Remote | `https://weworkremotely.com/remote-jobs/search?term={{ROLE_ENCODED}}` | [weworkremotely.md](skills/platforms/weworkremotely.md) |
| RemoteOK | Remote | `https://remoteok.com/remote-{{ROLE_SLUG}}-jobs` | [remoteok.md](skills/platforms/remoteok.md) |
| Welcome to the Jungle | Remote | `https://app.welcometothejungle.com/jobs` | [welcometothejungle.md](skills/platforms/welcometothejungle.md) |
| BuiltIn | Remote | `https://builtin.com/jobs/remote?search={{ROLE_ENCODED}}` | [builtin.md](skills/platforms/builtin.md) |
| Dice | Global | `https://www.dice.com/jobs?q={{ROLE_ENCODED}}&filters.workplaceTypes=Remote&filters.postedDate=ONE` | [dice.md](skills/platforms/dice.md) |
| ZipRecruiter | Global | `https://www.ziprecruiter.com/jobs-search?search={{ROLE_ENCODED}}&days=1` | [ziprecruiter.md](skills/platforms/ziprecruiter.md) |
| Wuzzuf | MENA | `https://wuzzuf.net/search/jobs/?q={{ROLE_ENCODED}}&a=hpb` | [wuzzuf.md](skills/platforms/wuzzuf.md) |
| Bayt | MENA | `https://www.bayt.com/en/international/jobs/{{ROLE_SLUG}}-jobs/` | [bayt.md](skills/platforms/bayt.md) |
| Greenhouse / Lever / Ashby | ATS | Direct employer boards or Google dorks (`site:boards.greenhouse.io`, `site:jobs.lever.co`, `site:jobs.ashbyhq.com`) + JSON feeds | [ats-engines.md](skills/platforms/ats-engines.md) |

Engine playbooks: [greenhouse.md](skills/ats/greenhouse.md), [lever.md](skills/ats/lever.md), [ashby.md](skills/ats/ashby.md), [smartrecruiters.md](skills/ats/smartrecruiters.md), [breezyhr.md](skills/ats/breezyhr.md), [workday.md](skills/ats/workday.md), [taleo.md](skills/ats/taleo.md).

### How to Add a New Job Platform (2-Minute Playbook)
1. Copy [`skills/platforms/_template.md`](skills/platforms/_template.md) to `skills/platforms/<board>.md` and document its search URL pattern, accessible job-card/JD expansion labels, apply trigger, and receipt confirmation text.
2. Add a disabled (`enabled: false`) target entry in [`context/targets.yaml.example`](context/targets.yaml.example) (or your private `context/targets.yaml`) with its real `auth_check_url` and `search_url_template`.
3. Register the new skill row in [`skills/REGISTRY.md`](skills/REGISTRY.md) and [`skills/skills-manifest.json`](skills/skills-manifest.json).

### Using Without MCP (Web Chat Fallback)
Running ChatGPT, Claude, or Gemini in a browser without Playwright MCP? Use [`skills/fallback-no-mcp.md`](skills/fallback-no-mcp.md): paste the job description and your redacted profile/CV into chat to get an honest `0–10` score, fact-checked ATS HTML from `templates/ats-resume-template.html`, browser `Print -> Save as PDF` steps, and grounded answers for manual form submission.

---

## 7. Mission Control Batch Table & Slash Commands

Before opening any form in `batch_review_first` mode, the AI posts a Mission Control briefing in chat and waits:

```text
| # | Company & Role                         | Score | Status      | What changed in tailored CV (or why skipped)             | Tailored files                                               |
|---|----------------------------------------|-------|-------------|----------------------------------------------------------|--------------------------------------------------------------|
| 1 | Acme Pay — Senior Backend Engineer     | 8.5   | 🟢 Ready    | Node.js/PostgreSQL first; payments bullet moved to top   | logs/resumes/acme-pay-senior-backend-engineer-linkedin-4012/ |
| 2 | Orbit — Platform Engineer              | 6.5   | 🟡 Stretch  | Needs Kubernetes; foreground Docker CI. Gap: Kubernetes  | — (on request)                                               |
| 3 | Lumen — iOS Developer                  | 2.0   | 🔴 Skipped  | Swift-only role; no iOS experience in CV                 | —                                                            |

I scanned 3 jobs: 1 is 🟢 Ready, 1 is 🟡 Stretch, and 1 was 🔴 Skipped.
Reply APPLY ALL GREEN, APPLY 1, or tell me which CV to tweak before I open any form.
```

### Slash Commands (or Plain-Text Chat Prompts)

| Command | Workflow | What it does |
|---|---|---|
| `/setup` | [`.agent/workflows/setup.md`](.agent/workflows/setup.md) | Runs readiness audit, CV ingestion, 3–4-question interview, and headed Playwright login |
| `/daily-run` | [`.agent/workflows/daily-run.md`](.agent/workflows/daily-run.md) | Full gated run: readiness -> auth -> discovery/ghost check -> Mission Control -> tailor -> fill/approve -> dossier/log |
| `/tailor-cv URL` | [`.agent/workflows/tailor-cv.md`](.agent/workflows/tailor-cv.md) | Tailors CV + fact-check + humanizer + `interview-dossier.md` for one URL (never applies) |
| `/apply-url URL` | [`.agent/workflows/apply-url.md`](.agent/workflows/apply-url.md) | Runs all safety gates and processes one supplied HTTPS job URL |
| `/weekly-report` | [`.agent/workflows/weekly-report.md`](.agent/workflows/weekly-report.md) | Generates local skill-gap & funnel analytics from `logs/applications-log.json` |
| `/linkedin-growth` | [`.agent/workflows/linkedin-growth.md`](.agent/workflows/linkedin-growth.md) | Drafts profile updates, posts, or `<= 75`-word outreach; waits for explicit `approve` |

---

## 8. Repository Map

| Path | Purpose |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Canonical brain, Progressive Disclosure rule, strict execution order, and 10 hard guardrails |
| [`skills/`](skills/REGISTRY.md) | `REGISTRY.md`, `skills-manifest.json`, core `00–06` playbooks, 4 `meta-*` skills, 16 platform playbooks, and 7 ATS playbooks |
| [`.agent/workflows/`](.agent/workflows/daily-run.md), [`commands/`](commands/daily-run.md) | Portable slash-command prompts for Antigravity, Claude Code, Cursor, Windsurf, Cline, and Copilot |
| [`context/`](context/DROP_YOUR_FILES_HERE.md) | Synthetic `.example` templates (`profile.md.example`, `form-answers.yaml.example`, `targets.yaml.example`, etc.); real files stay private |
| [`config/guardrails.yaml`](config/guardrails.yaml) | Default `dry_run: true`, warm-up caps, active hours, 3–9 s pacing, and `batch_review_first` settings |
| [`templates/`](templates/ats-resume-template.html) | Clean single-column ATS resume & cover-letter HTML templates |
| [`mcp/`](mcp/mcp.template.json) | Canonical Playwright & optional Notion MCP JSON template |
| [`docs/`](docs/repository-audit.md) | Chat command matrix, safety rules, platform registry, and repository audit |

---

## 9. Privacy, Pacing & Open-Source Governance

| Safeguard | Default Rule (`config/guardrails.yaml` & `AGENTS.md`) |
|---|---|
| Dry run by default | `dry_run: true` — stops before final Submit until you explicitly enable live mode and reply `APPROVE` |
| Warm-up & volume caps | Max **5/day** on the first 3 distinct non-aborted run dates, `active_hours` window, and `max_per_platform` |
| Human-paced actions | Randomized **3–9 s** delays between clicks/navigations, >= 10 s JD reading, 60 s cooldown after 15 actions |
| Hard security stops | Immediate `aborted` stop on CAPTCHA, 2FA, account warning, rate limit, or 3 consecutive errors (zero stealth/bypass) |
| Local-first privacy | Real `context/`, `logs/`, `*.pdf`, `.env`, and `browser-profile/` are strictly `.gitignore`d |

Contributions for new regional job-board playbooks, ATS engine workflows, resume template refinements, and multi-IDE improvements are welcome!

- Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and use [`skills/platforms/_template.md`](skills/platforms/_template.md) for new boards.
- Follow our [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) and [`SECURITY.md`](SECURITY.md) guidelines (never commit personal data, PDFs, logs, or tokens).
- Licensed under the [MIT License](LICENSE) — Copyright (c) 2026 Reda Salem (`redasalem`).
