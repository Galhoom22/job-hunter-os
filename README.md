# job-hunter-os

**An open-source AI Agent Skills & MCP Playbook repository for truthful, chat-driven job hunting.**

Clone it, open it in your AI IDE, bring your CV, and talk to your agent. Markdown skills guide discovery, honest scoring, local CV tailoring, safe applications and reports through Playwright MCP and optional Notion MCP. **The product is the playbooks—not a React dashboard, web service or autonomous daemon.**

## Architecture
```text
Your IDE chat + owner-verified CV
              |
     AGENTS.md + Markdown skills
              |
      +-------+------------------+
      |                          |
 Playwright MCP             IDE local file tools
 persistent Chromium        private context + JSON
      |                          |
 permitted job boards       local PDFs + Markdown reports
 and employer forms              |
                           optional Notion MCP
```
The owner authorizes a running local agent; the IDE supplies its model and tools. Instructions do not execute themselves, install MCP, register universal commands or run while the machine is off. Safety overrides job-match eligibility.

## 3-step quick start
1. **Clone and connect Playwright MCP.** Clone `https://github.com/redasalem/job-hunter-os.git`, open that folder in your IDE, and load [mcp/mcp.template.json](mcp/mcp.template.json). Use `--user-data-dir=./browser-profile` resolved to this repository's absolute path. The [MCP guide](mcp/README.md) covers permissions and optional Notion. No web server is needed.
2. **Say `/setup` and paste/drop your CV.** If your IDE does not expose that command, say **“Setup my profile from this CV.”** The [onboarding skill](skills/00-onboarding-chat.md) extracts facts, asks you to confirm missing answers, writes private context and opens a headed browser for you to log in yourself. It can run small local setup/validation helpers with permission; you do not need to hand-edit YAML.
3. **Say `/daily-run`.** Or: **“Run today's job discovery, CV tailoring and applications.”** Watch the agent use the browser. **Dry run is on by default: no final Submit.** Real submission requires your explicit choice to disable dry run, verified facts/resume, permitted targets, live sessions and successful preflight. CAPS, questions and security prompts may stop a run.

## Commands
| Request | Result |
|---|---|
| /setup | Chat-first CV extraction, confirmed profile/preferences, manual login, optional Notion trackers |
| /daily-run | Discover → score → tailor → safely fill/review → journal → report |
| /tailor-cv JOB_URL | Truth-preserving tailored HTML/PDF and evidence map; no application |
| /weekly-report | Measured skill demand/gaps in private Markdown and optional Notion |
| /linkedin-growth | Profile recommendations or post drafts; exact text needs explicit approval before Save/Post |
See [command portability](docs/chat-commands.md) for fallback prompts; slash-command support depends on the IDE/version.

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
See [CONTRIBUTING.md](CONTRIBUTING.md), [community registry](docs/platform-registry.md) and [MIT license](LICENSE). Maintainers can run `npm test`, `npm run test:agent-rules` and `npm run validate:logs -- --demo`. Real employer submissions, actual IDE tool compatibility, manual login and Notion read-back require authorized local testing; this documentation is not evidence of those outcomes.
