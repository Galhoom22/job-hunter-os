# job-hunter-os

**Your CV. Your AI IDE. One portable job-hunting agent home.**

![MIT](https://img.shields.io/badge/license-MIT-green)
![Zero backend](https://img.shields.io/badge/backend-not_required-black)
![Playwright MCP](https://img.shields.io/badge/browser-Playwright_MCP-green)
![Optional Notion](https://img.shields.io/badge/tracking-Notion_MCP_optional-blue)
![Multi IDE](https://img.shields.io/badge/IDE-multi--IDE-teal)

Markdown skills, truthful resume tailoring and safe application playbooks—installed locally in a project or globally across your machine. No web app or backend required. The CLI uses **Node.js 18+ and zero production dependencies**; the IDE supplies the model/MCP tools.

```text
Terminal anywhere: npx github:redasalem/job-hunter-os init --global
                            |
                 Node built-in CLI engine
                            |
       +--------------------+---------------------+
       |                    |                     |
 ~/.job-hunter-os/    IDE commands/rule pointers   MCP JSON merges
 skills + context    Claude / Cursor / others     Playwright profile
 templates + logs          |                     optional Notion
 browser-profile     chat: /setup → /daily-run
                            |
           verified facts → safe browser → local journal
```

## Quick installation — three options
Installation can be quick; first CV verification, browser/tool downloads and login can take longer. Git-sourced npx needs Git/npm/network access; no guaranteed 30-second setup.

### A. npx — local or global
```bash
npx github:redasalem/job-hunter-os init --global
npx github:redasalem/job-hunter-os doctor
# Or scaffold the current project (existing files preserved):
npx github:redasalem/job-hunter-os init
```
Doctor may return nonzero until you complete setup—that is expected, not a failed install. From any unrelated folder, later commands use the installed global home; an installed local project takes precedence. `--global` makes the choice explicit.

### B. One-line OS installer
Review the script before executing remote code.

macOS / Linux / Git Bash:
```bash
curl -fsSL https://raw.githubusercontent.com/redasalem/job-hunter-os/main/scripts/install.sh | bash
```
Windows PowerShell:
```powershell
irm https://raw.githubusercontent.com/redasalem/job-hunter-os/main/scripts/install.ps1 | iex
```
Installers preserve existing files/checkouts and use separate source/runtime folders; no automatic Git updates or elevation. These links require a publicly accessible repository. See [installation details](docs/cli-installation.md).

### C. Classic clone — no npm install needed for scaffolding
```bash
git clone https://github.com/redasalem/job-hunter-os.git
cd job-hunter-os
node ./bin/job-hunter.mjs init
```

## Chat-first use
1. Run `npx github:redasalem/job-hunter-os login` (or add `--global`). It opens installed Chrome/Chromium for manual LinkedIn, Wellfound, Wuzzuf and Indeed login. Close it before MCP; verify the actual sessions in setup. Missing browser? Use headed Playwright MCP during setup.
2. Open Antigravity, Cursor, Claude Code, Windsurf or Cline, drop your CV into chat and request `/setup`. The agent extracts only your facts, asks you to verify them and prepares private context. Missing native command? Ask “Setup my profile from this CV” and point it to your agent home's AGENTS.md.
3. Request `/daily-run` or `/apply-url JOB_URL`. **Dry run is on by default: no final Submit.** Actual submissions require verified facts/resume, permitted targets, live auth, caps and successful preflight. Optional local safety helpers require a separate approved dependency install and Node 22+; see [runtime details](docs/cli-installation.md).

## CLI reference
| Command | Result |
|---|---|
| init | Scaffold the current directory without overwriting owner files |
| init --global / -g | Create ~/.job-hunter-os and global IDE command/rule pointers |
| doctor [--global] | Node/npx, placeholder facts, PDF, MCP paths, browser-directory and optional-token diagnostics |
| login [--global] | Open installed Chrome/Chromium for owner-controlled login |
| sync-mcp [--global] | Non-destructive Playwright merges; optional Notion/Cline import files |
| add-platform NAME [--global] | New playbook plus disabled manual-review target; no automatic submission adapter |

## Chat commands
| Request | Outcome |
|---|---|
| /setup | Confirm CV facts/preferences, manual login and optional Notion provisioning |
| /daily-run | Discover → score → tailor → fill/review → journal → report |
| /tailor-cv JOB_URL | Truthful ATS HTML/PDF with evidence map, no application |
| /apply-url JOB_URL | One job through all normal gates; dry-run/review may prevent submission |
| /weekly-report | Measured skill demand/gaps in local Markdown and optional Notion |
| /linkedin-growth | Profile/post drafts or ≤75-word outreach; exact-text approval before any write/send |

Native command discovery/namespaces vary by IDE/version; legacy Claude `/user:` or `/project:` aliases are not universal. The installer writes six ready-to-copy command files; [portability guide](docs/chat-commands.md) and [path matrix](docs/cli-installation.md) cover manual imports. No scheduler or stealth automation.

## Supported IDEs
| IDE | Instruction entry |
|---|---|
| Antigravity | AGENTS.md + .agent/workflows/ |
| Cursor | .cursor/rules/job-hunter.mdc |
| Claude Code | CLAUDE.md |
| Windsurf | .windsurfrules |
| Cline / Roo | .clinerules |
| GitHub Copilot | .github/copilot-instructions.md (where local MCP agent mode is available) |
Each IDE must actually expose the browser/file tools and approvals. [Capability negotiation](skills/mcp-capabilities.md) handles missing PDF or Notion methods without pretending they exist.

## Platform and ATS playbooks
| Group | Coverage |
|---|---|
| [LinkedIn](skills/platforms/linkedin.md) | Filters, past-24h radar, Easy Apply, external redirects, approval-only profile/posts |
| [Wellfound](skills/platforms/wellfound.md) | Startup discovery, compensation/remote constraints, grounded founder notes |
| [Remote boards](skills/platforms/remote-boards.md) | WeWorkRemotely, RemoteOK, DailyRemote, Welcome to the Jungle / Otta, BuiltIn |
| [Global boards](skills/platforms/global-boards.md) | Indeed, Glassdoor, Dice, ZipRecruiter |
| [MENA boards](skills/platforms/mena-boards.md) | Wuzzuf, Bayt, LinkedIn MENA |
| [ATS engines](skills/platforms/ats-engines.md) | Greenhouse, Lever, Ashby, SmartRecruiters, Workable, BreezyHR |
| Manual fallback | Workday, Taleo, unknown hosts, inaccessible/account-creation flows |
DailyRemote and Workable use `other` (cap 0) until a schema-backed adapter is reviewed: discovery/manual review only, not enabled automated submissions. Platform documentation is not authorization to violate terms. Interfaces/tool versions change; **live compatibility is unverified until checked in your authorized environment**.

## Safety is part of the product
- Default score ≥7 is eligible, 5 to below your minimum needs review, <5 skipped. Eligibility is never permission to submit.
- First three distinct authorized run dates: at most **5 applications/day**, or a lower configured cap. Existing calendar warm-up, per-platform caps, unresolved submission reservations, active hours and cooldown apply too.
- Random **3–9-second** action waits and reading pauses reduce load; no stealth, evasion or anti-ban guarantee.
- CAPTCHA, 2FA, unexpected login, security warning, rate limit or three consecutive errors: stop and notify.
- Unknown factual/legal answers: screenshot, leave tab open, record needs_review and ask. Motivation drafts use verified facts/observed mission only, never fabricated claims.
- Local run lock, duplicate checks and pre-submit reservations; `applied` requires a receipt, and uncertain submissions are never retried blindly.
See [execution safety](docs/execution-safety.md). LinkedIn Save/Post always requires explicit approval of the exact text.

## Local-first privacy—with an honest boundary
There is no mandatory hosted backend or third-party tracker. Private context, real logs, browser profile, PDFs, exports, `.env` and generated MCP configs stay on your machine and out of Git by default. Only synthetic examples ship in the repository. **This is not a “100% data never leaves your machine” guarantee:** employers receive submitted data; optional Notion receives approved records; your IDE/model may process the CV/chat under its own policy. Use appropriately configured local models when required. [SECURITY.md](SECURITY.md) explains the limits of Git ignore and tool permissions.

## Repository map
- `AGENTS.md`: canonical instructions and guardrails.
- `skills/`, `prompts/`, `.agent/workflows/`: the agent product.
- `templates/`: ATS HTML templates; generated resumes go in private `logs/resumes/`.
- `mcp/`: single public server template and secure setup guidance.
- `context/*.example`, `config/`: structure examples and conservative settings; examples are not personal facts.
- `schemas/`, `scripts/`: optional local validation, locks, journal, PDF and export helpers; no application backend required.
- `demo/`: synthetic fixtures only.
- `src/`: retained compatibility preview, untouched by this shift; not required or marketed for agent use.

## Contribute and verify
See [CONTRIBUTING.md](CONTRIBUTING.md), [community registry](docs/platform-registry.md) and [MIT license](LICENSE). Maintainers can run `npm run test:cli`, `npm test`, `npm run test:agent-rules` and `npm run validate:logs -- --demo`. Real employer submissions, actual IDE tool compatibility, manual login and Notion read-back require authorized local testing; this documentation is not evidence of those outcomes.
