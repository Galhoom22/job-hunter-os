# job-hunter-os

**A local-first career companion for AI-powered IDEs. Honest matching. Human review where it matters.**

![MIT license](https://img.shields.io/badge/license-MIT-green)
![Local first](https://img.shields.io/badge/data-local--first-black)
![Playwright MCP](https://img.shields.io/badge/browser-Playwright_MCP-45ba4b)
![Multi IDE](https://img.shields.io/badge/IDE-Antigravity_%7C_Cursor_%7C_Claude_Code_%7C_Windsurf_%7C_Cline-blue)

## Quick start in 3 steps
```bash
git clone https://github.com/redasalem/job-hunter-os.git
# Open the cloned folder in a terminal, then:
npm install && npm run setup
# In your AI IDE: “Start today's job run” (or /daily-run if that IDE supports it).
```
Setup initializes missing files without overwriting them, collects profile facts and preferred IDEs, creates private MCP configs and keeps Notion optional. An initial setup can be quick; real resume preparation, legal-answer review, Chromium download and manual login may take longer than two minutes. No invented personal facts.

Put the base PDF at assets/resume.pdf. `npx playwright install chromium` if needed, then `npm run browser:login` for manual login. Review all form answers before owner_verified:true. `npm run dev` opens the companion at localhost:8080. `npm run setup:check` reports incomplete prerequisites without modifying files. A real run requires successful preflight and enabled permitted targets; templates begin disabled.

## Two layers, one source of truth
```text
YOUR MACHINE
+-----------------------+      +--------------------------+
| Authorized AI IDE     | ---> | AGENTS.md + playbooks     |
| local agent process   |      | safety / CV / preferences |
+-----------+-----------+      +------------+-------------+
            | Playwright MCP               |
            v                              v
  Persistent Chromium             Private local JSON
  manual login / apply            logs / resumes / exports
            |                              |
            v                              v
  Employers / job boards          Local Companion Dashboard
                                  overview / review / reports
                                           |
                                  optional Notion MCP sync
HOSTED PREVIEW: synthetic read-only demo, not a runner
```

## Feature matrix
| Capability | Included | Boundary |
|---|---|---|
| Setup + health checks | CLI + dashboard | Local files only; login/access still verified manually |
| CV matching | >=7 eligible, 5–6 review, <5 skip | Never overrides consent or safety |
| Resume tailoring | Verified sentence/skill/bullet ordering, local PDF | No invented keywords or new experience |
| Safety | Dry run, caps, warm-up, active hours, cooldown | No stealth/bypass, no anti-ban guarantee |
| Tracking | Local JSON, CSV, Markdown; optional Notion | Local JSON always primary |
| Exports | CSV / JSON downloads and Markdown clipboard | Personal downloads stay private |
| Agent runs | Canonical playbooks + local run lock | Requires an authorized, running IDE/model process |

## Supported IDEs
Antigravity, Cursor, Claude Code, Windsurf, Cline/Roo and GitHub Copilot have canonical instruction pointers. Claude/Cursor MCP configs are generated; other IDE versions may require importing server definitions into their supported MCP settings. Instruction files do not install tools, grant permissions or universally register slash commands.

## Platform playbooks
Global: LinkedIn, Wellfound, Indeed, Glassdoor, Dice, ZipRecruiter.
Remote: WeWorkRemotely, RemoteOK, BuiltIn, Welcome to the Jungle (Otta).
Regional: Wuzzuf, Bayt. Community template ready for StepStone, Xing, Naukri and other boards—not yet implemented.
ATS: Greenhouse, Lever, Ashby, SmartRecruiters, BreezyHR. Workday/Taleo: manual_apply + needs_review.
See [registry](docs/platform-registry.md). Playbooks are conservative guides, not a guarantee against changing interfaces or platform restrictions.

## Daily commands
| Command | Outcome |
|---|---|
| npm run setup / setup:check | Interactive onboarding / read-only readiness |
| npm run browser:login | Headed persistent manual login |
| npm run sync:mcp -- --headless | Same profile, background browser mode |
| npm run preflight | Fail-closed eligibility/settings check |
| npm run resume:render -- COMPANY ROLE KEYWORD... | Verified-fact tailored PDF |
| npm run export | Private CSV + Markdown artifacts |
| npm run validate:logs | Validate real local history |
| npm test | Unit/schema safety tests |

## Privacy, without impossible promises
Cookies, PDFs, personal context, history and generated configs are ignored and untracked; only synthetic demo data ships in hosted builds. Applications send chosen facts/resumes to employers; optional Notion and your selected AI IDE/model have their own data policies. No claim that all data never leaves your machine. Read [SECURITY.md](SECURITY.md).

MIT licensed. Contributions welcome via [CONTRIBUTING.md](CONTRIBUTING.md). Live applications, Notion read-back and unattended behavior must be verified in your actual authorized environment before enabling real submission. No scheduler is installed by opening this dashboard.
