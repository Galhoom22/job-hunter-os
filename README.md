# job-hunter-os

**Your CV. Your AI IDE. A careful job-hunting agent—not a blind auto-apply bot.**

[![MIT License](https://img.shields.io/badge/License-MIT-2ea44f)](LICENSE)
[![Playwright MCP](https://img.shields.io/badge/Browser-Playwright_MCP-167d60)](mcp/README.md)
[![Notion MCP optional](https://img.shields.io/badge/Tracking-Notion_MCP_optional-356ac3)](skills/setup-notion.md)
[![Local-first privacy](https://img.shields.io/badge/Privacy-Local--first-555555)](SECURITY.md)
[![Multi-IDE ready](https://img.shields.io/badge/IDE-Multi--IDE_ready-167d60)](docs/chat-commands.md)

## 1. One agent home, five reasons to exist

- **Zero mandatory cloud lock-in.** Markdown playbooks, local JSON records and a Node.js 18+ installer with zero production dependencies. Your IDE supplies the model and MCP tools.
- **Persistent local browser sessions.** A dedicated `browser-profile/`, owner-controlled login and fresh access checks—not credential sharing in chat.
- **Job-specific ATS resumes.** Rephrase and reorder verified facts, keep an evidence map, inspect the PDF and upload exactly that artifact.
- **Readiness before execution.** Five verified gates, focused chat interviews and explicit consent for every launch. No guessed salary, legal answers or skill tenure.
- **Conservative pacing, not “anti-ban stealth.”** Warm-up caps, 3–9-second action waits and security hard stops limit load; no evasion or guarantee against restrictions.

This is a **chat + Markdown skills + MCP product**. No web app, application backend or scheduler is required. The retained `src/` compatibility preview is not the agent runner. Platform playbooks describe supported workflows; they do **not** certify current live compatibility or grant permission to violate a site's terms.

## 2. Architecture & execution lifecycle

### System architecture

```text
USER CHAT: /setup | /daily-run | /apply-url URL | /tailor-cv URL
                               |
                               v
+--------------------------------------------------------------------+
| AI IDE + chosen model                                              |
| Antigravity / Cursor / Claude Code / Windsurf / Cline / Copilot     |
| Actual file/browser tools + explicit permissions required           |
+-------------------------------+------------------------------------+
                                | reads canonical AGENTS.md
                                v
+--------------------------------------------------------------------+
| MARKDOWN SKILLS: skills/ + prompts/ + templates/                    |
| Readiness -> discovery -> scoring -> tailoring -> form -> journal   |
+-------------------------------+------------------------------------+
                                |
                  +-------------v--------------+
                  | READINESS GATEKEEPER       |
                  | context/ + bin/readiness   |
                  | 5 verified gates + consent|
                  +-------------+--------------+
                                |
              owned lock -> preflight -> auth -> load context
                                |
             +------------------+-------------------+
             v                                      v
+-----------------------------+      +-------------------------------+
| Playwright MCP              |      | Local JSON: PRIMARY TRACKER   |
| browser-profile/ (private)  |----->| logs/applications-log.json    |
| snapshots / refs / labels   |      | runs + PDFs + evidence        |
| employer pages receive data|      +---------------+---------------+
+-----------------------------+                      |
                                                     v (opt-in)
                                      +------------------------------+
                                      | Notion MCP                   |
                                      | Applications / Daily Runs /  |
                                      | Weekly & Monthly Insights    |
                                      +------------------------------+
```

The IDE/model coordinates the skills; Markdown does not execute itself. Local files are primary; Notion is optional and cannot replace the journal. Resolve everything against the **agent home**, not an unrelated editor project.

### How the agent reads, decides and acts

```text
Phase 0  AUDIT readiness-state.json + actual source evidence
         |
         +-- incomplete/stale -> HARD BLOCK -> 3-4 questions -> verify
         |                                      -> private writes -> audit again
         +-- complete --------> mission briefing -> fresh explicit consent
                                                     |
          OWNED LOCK -> PREFLIGHT (exit 0) -> AUTH -> LOAD CONTEXT
                                                     |
Phase 1  CONSTRUCT URL from confirmed roles + target template
         -> paced browser_navigate -> verify applied filters
                                                     |
Phase 2  browser_snapshot -> accessible names/roles/refs -> full JD
         -> stable posting identity + duplicate checks
                                                     |
Phase 3  SCORE verified CV/profile against JD
         <5: skipped | 5..<minimum: needs_review | >=minimum: eligible
                                                     |
Phase 4  TAILOR supported facts -> evidence map -> local HTML -> PDF
         -> inspect every page -> record exact per-job path
                                                     |
Phase 5  SNAPSHOT FORM -> type/select -> exact PDF upload -> verify
         unknown required fact -> needs_review + screenshot + chat question
         -> scoped owner-confirmed answer -> revalidate before resuming
                                                     |
         FINAL GATES: permissions / hours / caps / dedup / answers / PDF
         dry run -> STOP BEFORE SUBMIT
         live -> reserve locally -> validate -> SUBMIT ONCE -> verify receipt
                                                     |
Phase 6  LOCAL JSON -> validate -> optional Notion upsert -> run report
         receipt confirmed: applied | uncertain: needs_review, NEVER blind retry
         release owned lock (including aborted paths)
```

**Preserve the order:** Phase 0 is mandatory, then lock → `npm run preflight` → auth verification → context loading. URL discovery never precedes these steps. See [daily-run orchestration](skills/00-daily-run.md) and [execution safety](docs/execution-safety.md).

<details>
<summary><strong>URL construction: encoding, parameters and verification</strong></summary>

Read raw `context/targets.yaml` and owner-confirmed `context/preferences.yaml`. The registry contains:

| Field | Meaning |
|---|---|
| `url` | Concrete synthetic fallback accepted by the existing runtime contract; not an owner preference |
| `search_url_template` | Entry point to resolve per confirmed role; never navigate unresolved tokens |
| `query_parameters` | Human/agent-readable parameter map; not an additional query to append twice |
| `auth_check_url`, `auth_required` | Where and whether observable signed-in evidence is needed |
| `playbook`, `automation_mode`, `filter_notes` | Routing and limitations; metadata is not submission permission |
| `enabled`, `max_results` | Explicit opt-in and bounded discovery; all shipped targets are disabled |

`{{ROLE}}` means raw verified role text; `{{ROLE_ENCODED}}` and `{{LOCATION_ENCODED}}` mean `encodeURIComponent(rawValue)` **once**. `{{ROLE_SLUG}}` means lowercase/hyphenated role text, but Wellfound/RemoteOK/category routes may need a real board taxonomy slug. `{{EMPLOYER_SLUG}}` comes from an actual verified employer link, never a guessed company name. For multilingual or unmapped slugs use the board's accessible search controls.

```js
// Illustrative construction recipe, NOT a new CLI command or browser runner.
const role = "Frontend Engineer"; // example only; read a confirmed role at runtime
const location = "Remote";       // example only; respect approved regions
const url = template
  .replaceAll("{{ROLE_ENCODED}}", encodeURIComponent(role))
  .replaceAll("{{LOCATION_ENCODED}}", encodeURIComponent(location));
// Resolve any required taxonomy/employer slug from verified board evidence.
if (/\{\{[^}]+\}\}/.test(url)) throw new Error("Unresolved search template");
// Verify HTTPS + intended hostname; then paced browser_navigate and snapshot.
```

For LinkedIn the example resolves to `keywords=Frontend%20Engineer&f_WT=2&f_TPR=r86400`. Do not run `encodeURIComponent` on the whole URL. For a raw query map, use `URLSearchParams` on raw values instead of pre-encoding and encoding again. Search URLs are starting points: verify the current visible role, region, remote and date filters after navigation. A Remote filter does not establish worldwide eligibility. The legacy `Targets` Zod parser strips metadata, so the agent reads the raw registry; no automatic runtime URL builder is claimed.

Google ATS discovery encodes the complete query `site:boards.greenhouse.io "Frontend Engineer" AND "Remote"` with `tbs=qdr:d`. This filters Google's index recency, **not** reliably the job posting date. Follow actual employer results, verify host/company/job ID, then dispatch to the ATS playbook. Never submit to Google or invent an employer board URL.

</details>

<details>
<summary><strong>Snapshots, scoring, tailoring and the unknown-answer loop</strong></summary>

- `browser_snapshot` exposes the DOM accessibility tree: named links/buttons/inputs and current `ref` IDs. Use a fresh snapshot and its refs with `browser_click`, `browser_type`, `browser_select_option` and `browser_file_upload` **only if those tools are actually exposed**. No fragile CSS selectors, guessed refs or blind pixel clicks. Re-snapshot after navigation, modal changes, conditional questions and uploads.
- Read the **complete** description, including geographic restrictions, for at least 10 seconds and longer as needed. Compare with `context/profile.md` and `context/cv.md`. Default routing is ≥7 eligible, 5 to <7 review, <5 skip. A higher configured minimum changes the review band; a score is never submission authorization. See [scoring](skills/score-job.md).
- Copy [the ATS HTML template](templates/ats-resume-template.html) to private `logs/resumes/<company>-<role>-<stable-id>.html`. Only surface keywords supported by confirmed facts. Never add a tool, achievement or years of experience just because a JD requests it. Escape source text, keep single-column selectable text and an evidence map. Inspect `logs/resumes/<company>-<role>-<stable-id>.pdf` page by page before upload.
- PDF printing is capability-dependent: use an exposed MCP PDF/print facility, an approved local renderer or owner-controlled Print → Save as PDF. Do not invent a PDF tool or relax local-file security. See [capability negotiation](skills/mcp-capabilities.md) and [truthful tailoring](skills/tailor-resume.md).
- Unknown required factual/legal/consent answers block the job. Save `needs_review`, a private screenshot and the exact question, leave the tab open and ask the owner. Confirm and save the **context-scoped** answer in `context/form-answers.yaml`; never treat a salary, visa answer or consent as universally valid forever. Reconfirm if its meaning, employer, jurisdiction or facts change. No background work continues while waiting.
- Check `job_id` and employer/role/canonical ATS URL **before filling**, then reload the journal and caps immediately before submission. Local reservation precedes live Submit; a confirmed job-identifiable receipt is required for `applied`. Notion uses query-before-create/update and read-back when enabled. An outage leaves a valid local unsynced record, not a repeated employer submission.

</details>

## 3. Quick installation: the “30-second” entry point

Scaffolding is quick; Git/network access, MCP/browser downloads, fact verification and login can take longer. **No 30-second readiness guarantee.** The installation CLI supports Node.js 18+ with zero production dependencies; mandatory application helpers separately need Node.js 22+ and an owner-approved local dependency install.

### A. Run from any directory

```bash
npx github:redasalem/job-hunter-os init --global
npx github:redasalem/job-hunter-os doctor --global
```

Global agent home: `~/.job-hunter-os/`. For a project-local home use `init` without `--global`. Later commands prefer an installed current folder, otherwise the installed global home; `--global` selects it explicitly. Doctor returning nonzero for incomplete setup is expected.

### B. OS one-liners

**Review remote scripts before executing them.** Raw GitHub URLs need a publicly accessible repository; private-repository access is not magically handled by these commands.

macOS / Linux / Git Bash:

```bash
curl -fsSL https://raw.githubusercontent.com/redasalem/job-hunter-os/main/scripts/install.sh | bash
```

Windows PowerShell:

```powershell
irm https://raw.githubusercontent.com/redasalem/job-hunter-os/main/scripts/install.ps1 | iex
```

Installers keep a separate source checkout and private runtime home, preserve existing files and require no elevation. They do not automatically update existing checkouts.

### C. Standard clone

```bash
git clone https://github.com/redasalem/job-hunter-os.git
cd job-hunter-os
node ./bin/job-hunter.mjs init
```

Scaffolding needs no `npm install`. During `/setup`, approve a dedicated local helper install when required; never bypass preflight because dependencies are missing or blindly execute an unrelated project's scripts.

**Next:** `login` → close the manual browser → open your IDE → `/setup` with your CV → `/daily-run`. **Dry run is on by default: no final Submit.** Re-running `init` is additive and preserves owner files, not a destructive upgrade. See [installation paths and runtime details](docs/cli-installation.md).

## 4. Smart readiness interrogation: no manual config editing

Typing `/daily-run` does **not** mean “submit immediately.” The shared [readiness audit](bin/readiness.mjs) checks actual sources and [the state contract](schemas/readiness.schema.json), not only a self-declared `READY_100%` string.

| Gate | Required verified evidence |
|---|---|
| 1 · CV | Real CV/profile, approved facts and inspected base PDF |
| 2 · Targets | Roles, seniority, work mode, regions, timezone and blacklist choices |
| 3 · Terms & legal facts | Compensation amount/currency/period, notice/start date, authorization and sponsorship |
| 4 · Skills | Exact hands-on years for every core skill; zero is allowed, guessing is not |
| 5 · Platform access | Selected platforms and recent observable session/access evidence |

<details open>
<summary><strong>Example chat: first /daily-run (fictional owner, not stored personal facts)</strong></summary>

> **Developer:** `/daily-run`
>
> **Agent:** Applications are blocked. CV, preferences, legal/compensation facts, skill years and platform access are not verified. First four questions: (1) Attach your real CV/PDF. (2) Which roles and seniority? (3) Remote/hybrid/on-site, allowed regions and timezone? (4) Any excluded companies or role keywords?
>
> **Developer:** Here is my CV. Mid-level frontend roles; remote roles accepting Egypt, Africa/Cairo; no unpaid work. No company blacklist.
>
> **Agent:** I extracted these CV facts for your confirmation; I have not inferred missing experience. Next four: (1) Minimum salary, currency and monthly/annual basis? (2) Notice period or earliest start date? (3) Countries where you are authorized to work and sponsorship needs? (4) Exact hands-on years for each extracted core skill—React, TypeScript and testing?
>
> **Developer:** USD 2,500 gross/month, 30-day notice, Egypt authorization only and sponsorship needed elsewhere; React 3, TypeScript 2, testing 1 year. Those CV facts are correct.
>
> **Agent:** I saved your confirmed answers privately and will not infer foreign work rights from remote availability. Three final checks: (1) Which platforms do you approve? (2) Please inspect this base PDF and confirm it accurately reflects your CV. (3) May I open the dedicated browser for manual login and verify current access? Keep credentials out of chat.
>
> **Developer:** LinkedIn and Wuzzuf. PDF confirmed; open the browser. [Owner logs in manually; agent observes signed-in evidence.]
>
> **Agent:** All five gates now pass against current evidence. Mission: approved frontend roles accepting Egypt, LinkedIn/Wuzzuf, default minimum score 7, effective cap no more than 5 on your first authorized run date (lower platform limits still apply), **dry run ON**. No final submission. Start this round?
>
> **Developer:** Yes, start this dry run.
>
> **Agent:** I will acquire the lock, run preflight, verify access again, then load context. If any check fails, I stop.

</details>

The agent writes confirmed answers automatically to private context files. Missing or stale evidence returns to focused **3–4-question batches**; optional metrics/portfolio links may be omitted. You can drop a PDF into `context/` or `assets/` and say “Check my folder”; see [the CV drop guide](context/DROP_YOUR_FILES_HERE.md). Readiness is **not** blanket submission consent or a permanent login guarantee. Switching to live mode requires a new explicit briefing and all normal gates.

## 5. Platform registry, direct ATS search & URL matrix

Patterns below match [the public registry template](context/targets.yaml.example). They are preconfigured navigation recipes, **live-unverified**, and shipped disabled. Search terms come from verified owner preferences. “Full form” describes a possible approved flow, not guaranteed automation; inaccessible controls, unsupported hosts and account creation fall back to manual review.

| Platform | Category | Default search URL pattern | Playbook | Automation mode |
|---|---|---|---|---|
| LinkedIn Jobs | Global | `https://www.linkedin.com/jobs/search/?keywords={{ROLE_ENCODED}}&f_WT=2&f_TPR=r86400` | [linkedin.md](skills/platforms/linkedin.md) | Easy Apply / verified external ATS / manual fallback |
| Wellfound (AngelList) | Global | `https://wellfound.com/role/r/{{ROLE_SLUG}}` | [wellfound.md](skills/platforms/wellfound.md) | Full form / manual fallback; verify taxonomy slug |
| Indeed | Global | `https://www.indeed.com/jobs?q={{ROLE_ENCODED}}&l=Remote&fromage=1` | [indeed.md](skills/platforms/indeed.md) | Full form / external ATS / manual fallback |
| Glassdoor | Global | `https://www.glassdoor.com/Job/jobs.htm?sc.keyword={{ROLE_ENCODED}}` | [glassdoor.md](skills/platforms/glassdoor.md) | Discovery / redirect / manual fallback |
| WeWorkRemotely | Remote | `https://weworkremotely.com/remote-jobs/search?term={{ROLE_ENCODED}}` | [weworkremotely.md](skills/platforms/weworkremotely.md) | Discovery → external ATS / manual fallback |
| RemoteOK | Remote | `https://remoteok.com/remote-{{ROLE_SLUG}}-jobs` | [remoteok.md](skills/platforms/remoteok.md) | Discovery → external ATS; validate tag slug |
| Welcome to the Jungle (Otta) | Remote | `https://app.welcometothejungle.com/jobs` | [welcometothejungle.md](skills/platforms/welcometothejungle.md) | Signed-in app filters / full form / manual fallback |
| BuiltIn | Remote | `https://builtin.com/jobs/remote?search={{ROLE_ENCODED}}` | [builtin.md](skills/platforms/builtin.md) | Discovery → external ATS / manual fallback |
| Dice | Global | `https://www.dice.com/jobs?q={{ROLE_ENCODED}}&filters.workplaceTypes=Remote&filters.postedDate=ONE` | [dice.md](skills/platforms/dice.md) | Full form / external ATS / manual fallback |
| ZipRecruiter | Global | `https://www.ziprecruiter.com/jobs-search?search={{ROLE_ENCODED}}&days=1` | [ziprecruiter.md](skills/platforms/ziprecruiter.md) | Full form / external ATS / manual fallback |
| Wuzzuf | MENA | `https://wuzzuf.net/search/jobs/?q={{ROLE_ENCODED}}&a=hpb` | [wuzzuf.md](skills/platforms/wuzzuf.md) | Full form / screening / manual fallback |
| Bayt | MENA | `https://www.bayt.com/en/international/jobs/{{ROLE_SLUG}}-jobs/` | [bayt.md](skills/platforms/bayt.md) | Full form / manual fallback; confirm country |
| Greenhouse via Google | ATS | `https://www.google.com/search?q=site:boards.greenhouse.io%20%22{{ROLE_ENCODED}}%22%20AND%20%22Remote%22&tbs=qdr:d` | [ats-engines.md](skills/platforms/ats-engines.md) + [greenhouse.md](skills/ats/greenhouse.md) | Discovery only → verified employer full form |
| Lever via Google | ATS | `https://www.google.com/search?q=site:jobs.lever.co%20%22{{ROLE_ENCODED}}%22%20AND%20%22Remote%22&tbs=qdr:d` | [ats-engines.md](skills/platforms/ats-engines.md) + [lever.md](skills/ats/lever.md) | Discovery only → verified employer full form |
| Ashby via Google | ATS | `https://www.google.com/search?q=site:jobs.ashbyhq.com%20%22{{ROLE_ENCODED}}%22%20AND%20%22Remote%22&tbs=qdr:d` | [ats-engines.md](skills/platforms/ats-engines.md) + [ashby.md](skills/ats/ashby.md) | Discovery only → verified employer full form |
| SmartRecruiters | ATS | `https://jobs.smartrecruiters.com/` + actual employer/job link | [ats-engines.md](skills/platforms/ats-engines.md) | Verified employer full form; root is not role search |
| BreezyHR | ATS | `https://breezy.hr/` → verified employer subdomain `/p/<id>` | [ats-engines.md](skills/platforms/ats-engines.md) | Verified employer full form; root is not role search |
| Workable | ATS | Actual employer link under `https://apply.workable.com/` | [ats-engines.md](skills/platforms/ats-engines.md) | Documentation/manual only via `other`, cap 0 |
| Workday / Taleo | ATS | Actual employer links on recognized ATS hosts | [ats-engines.md](skills/platforms/ats-engines.md) | Manual fallback only; never automated account creation |
| DailyRemote | Remote | `https://dailyremote.com/` → accessible search | [remote-boards.md](skills/platforms/remote-boards.md) | Documentation/manual only via `other`, cap 0 |

Google dorks are a **discovery channel**, not an ATS form. Also check verified Greenhouse results on `job-boards.greenhouse.io`; the legacy-host dork can miss them. Remote tags and date parameters require visible confirmation; authentication requirements can change. Nothing in the matrix overrides owner authorization, permitted automation, live access or exact resume/answer checks.

## 6. Add a niche platform: a two-minute scaffold, not a certified adapter

StepStone, Xing, Naukri, GulfTalent and Hacker News Who's Hiring can all begin as **manual-review discovery** playbooks. Two minutes can create the scaffold; genuine validation takes longer.

1. **Create a disabled target and playbook:**

   ```bash
   npx github:redasalem/job-hunter-os add-platform stepstone --global
   ```

   `add-platform` copies [the platform template](skills/platforms/_template.md), adds a disabled `platform: other` target and preserves existing files. Its `https://example.invalid/` URL is deliberately nonfunctional until confirmed in chat. Run `init` first; simple single-root block-style target YAML is supported.

2. **Provide the real board URL in chat.** Ask the agent to add `search_url_template`, parameters, auth evidence and a concrete resolved `url` in private `context/targets.yaml`. It must verify host/path and accessible filters rather than invent a StepStone/Naukri query syntax. Contributors add only public synthetic examples to `context/targets.yaml.example`, never private preferences.

3. **Define four board-specific rules in `skills/platforms/stepstone.md`:**

   | Rule | Required evidence |
   |---|---|
   | Search URL | Actual route, role/location encoding, filter verification and auth policy |
   | Job card extraction | Accessible titles/links, stable posting ID, canonical employer URL, full JD |
   | Apply trigger | Current accessible button/link; draft vs redirect vs irreversible one-click action |
   | Submission confirmation | Job-identifiable receipt, upload verification and uncertainty handling; no blind retry |

4. **Keep manual mode until reviewed.** `other` has cap 0. Automatic submission needs a schema-backed key, explicit cap, safe ATS dispatch and meaningful tests; a Markdown file alone cannot grant it. Retain all readiness, dedup, dry-run, unknown-question and security-stop rules.

See [community registry](docs/platform-registry.md), [contribution guidance](CONTRIBUTING.md) and [shared contracts](schemas/index.ts). Hacker News/email-style applications may require owner hand-off, not a generic form automation adapter.

## 7. Complete CLI & chat command reference

### Terminal commands

Prefix with `npx github:redasalem/job-hunter-os` or use `node ./bin/job-hunter.mjs` from a clone.

| Command | Result | Important boundary |
|---|---|---|
| `init` | Scaffold current directory | Preserves CV, context, journal, settings and existing manifest |
| `init --global` / `init -g` | Create `~/.job-hunter-os/` and IDE pointers | Discovery/import support varies by IDE version |
| `doctor [--global]` | Audit readiness, paths and structural prerequisites | Nonzero until complete; not live auth or submission consent |
| `login [--global]` | Open installed Chrome/Chromium with dedicated profile | Manual LinkedIn/Wellfound/Wuzzuf/Indeed tabs; no credential reading or silent browser install |
| `sync-mcp [--global]` | Non-destructive Playwright MCP merge | Conflicting server preserved/refused; Notion is a separate opt-in import |
| `add-platform NAME [--global]` | Copy playbook and disabled `other` target | No working adapter or permission to submit; lowercase slug only |

### AI IDE chat commands

| Request | Skill / result | Submission policy |
|---|---|---|
| `/setup` | [Conversational onboarding](skills/00-onboarding-chat.md): CV facts, preferences, access, optional Notion | No daily-run submission |
| `/daily-run` | [Daily orchestration](skills/00-daily-run.md): gated discovery → score → tailor → form → journal → report | Fresh briefing; dry run default |
| `/tailor-cv JOB_URL` | [Tailor resume](skills/tailor-resume.md): evidence map, local HTML/PDF, gaps | Never applies |
| `/apply-url JOB_URL` | [Single-job application](skills/apply-url.md) | All five gates, fresh consent and normal safety checks |
| `/weekly-report` | [Weekly insights](skills/weekly-insights.md): local skill-demand/gap report, optional Notion | No applications |
| `/linkedin-growth` | Profile/post/outreach drafts via growth playbooks | Exact-text approval before Save/Post/send; outreach ≤75 words |

Native slash registration is IDE/version-dependent. If a command is not discovered, say “Read my agent home's AGENTS.md and run today's job-hunting workflow” or use [the six portable workflows](docs/chat-commands.md). Never imply an unregistered slash command runs by itself.

## 8. Multi-IDE & multi-model compatibility

The model reads the same canonical instructions and Markdown skills; it must actually expose local file tools, an authorized browser MCP connection and required permissions. Model choice does not bypass factual verification or safety rules. Capability gaps trigger an explicit fallback, not invented tools.

| IDE | Repository instruction entry | Command/workflow entry | Compatibility caveat |
|---|---|---|---|
| Antigravity | `AGENTS.md` | `.agent/workflows/` | Global workflow discovery varies; import if needed |
| Cursor | `.cursor/rules/job-hunter.mdc` → `AGENTS.md` | Portable command prompts | Verify supported user-rule and MCP paths |
| Claude Code | `CLAUDE.md` → `AGENTS.md` | `.claude/commands/*.md` after init | Slash names/namespaces depend on version |
| Windsurf | `.windsurfrules` → `AGENTS.md` | `.windsurf/workflows/` after init | Verify local/global discovery for your version |
| Cline / Roo | `.clinerules` → `AGENTS.md` | Portable chat prompts | Import `mcp/cline.import.json` explicitly; editor settings paths vary |
| GitHub Copilot | `.github/copilot-instructions.md` → `AGENTS.md` | Portable chat prompts | Requires a local agent mode supporting MCP/tools; no guaranteed global injection |

<details>
<summary><strong>Global IDE injection and MCP locations</strong></summary>

Global install writes non-overwriting pointers/commands in `~/.claude/commands/`, `~/.cursor/rules/`, `~/.antigravity/workflows/`, `~/.windsurf/workflows/`, `~/.windsurf/rules/` and `~/.clinerules/`. Some are version-dependent import locations, not universally discovered native commands.

MCP merges target Claude `~/.claude.json`, Cursor `~/.cursor/mcp.json`, Antigravity `~/.gemini/antigravity/mcp_config.json`, Windsurf `~/.codeium/windsurf/mcp_config.json`, plus the agent-home `.mcp.json`. Cline receives a private import file. Local initialization may still touch user-level Antigravity/Windsurf MCP settings; review that behavior before installing.

The single MCP source is [mcp/mcp.template.json](mcp/mcp.template.json). Existing servers/settings are preserved; an incompatible same-name Playwright server is refused, not hijacked. Tokens are never copied into new configurations. Close the manual browser before MCP and verify session/browser-version compatibility. [Full path matrix](docs/cli-installation.md) and [MCP setup](mcp/README.md) cover limitations.

</details>

Use appropriately configured local models when privacy requires them, but tool/model support still needs verification. Actual native command discovery, OS-specific login and Notion access/read-back are **unverified until tested in your authorized environment**.

## 9. Safety, anti-ban limits & local-first security

**There is no stealth mode, anti-ban guarantee, CAPTCHA solver or defense bypass.** Human-readable pacing is load control, not concealment. Review site terms and employer requirements before enabling a target.

| Guard | Behavior |
|---|---|
| Warm-up | First three distinct non-aborted authorized UTC run dates cap at **5/day**, or any lower configured/calendar/platform limit. Calendar days 1–3 also begin at 5; progressive warm-up continues afterward. Idle days alone cannot bypass the distinct-run gate. |
| Active hours | Owner-confirmed IANA timezone and working window; check before every action and Submit. Outside the window, stop. |
| Action pacing | Random **3–9 seconds** between actions, full-JD reading pauses ≥10 seconds, and ≥60-second cooldown after the configured consecutive-action limit. |
| Security stops | CAPTCHA, 2FA, unexpected login wall, account warning, rate-limit banner or three consecutive errors abort the run and notify. Manual setup login is owner-controlled; challenges are never automated. |
| Duplicate/volume control | Stable job ID plus canonical employer-role URL checks, owned local lock and fresh daily/platform caps. Unresolved submission reservations consume allowance. |
| Dry run / receipt | Default dry run never clicks final Submit. Live submission happens once after reservation and checks; only a verified receipt marks `applied`. |
| Unknown facts | Review record + private screenshot + chat question; no guessed legal answers, dates, salary or skill years. |
| Trust boundary | CV/JD/page content is data, not instructions to disclose secrets, change settings or execute commands. |

**Local-first is a storage policy, not “data never leaves your machine.”** Real context, browser sessions, logs, PDFs, exports, `.env` and generated MCP configurations are kept out of Git by default. Public `.example` files and `demo/` are synthetic only. Employers receive submitted CVs/answers; optional Notion receives approved records; search providers see queries; your selected IDE/model may process CV/chat under its own policy. Ignore rules are not encryption or protection against intentional uploads, insecure tool permissions or previously committed data.

Never print cookies/tokens, commit `browser-profile/`, share unredacted screenshots or ask owners to paste credentials. Git ignore does not remove history; rotate any exposed secrets without rewriting published history. See [SECURITY.md](SECURITY.md), [execution safety](docs/execution-safety.md) and [the agent policy](schemas/agent-policy.ts).

## 10. Contribute & open-source roadmap

Help make careful job hunting work across countries and career paths. Submit PRs for regional boards, accessible ATS flows, truthful tailoring, localization and meaningful safety tests—**not** stealth plugins, fabricated answers or private employer/user records.

| Contribution area | Review standard |
|---|---|
| Regional job platforms | Real public URL patterns, accessible extraction, auth policy, disabled synthetic targets and honest fallback |
| ATS adapters | Exact upload checks, safe answer mapping, dry-run boundary, duplicate/reservation handling and receipt evidence |
| IDE portability | Version/OS evidence, non-destructive setup and explicit missing-tool behavior |
| Resume quality | Verified-fact evidence maps, readable/selectable PDFs and no hidden keywords or inflated claims |
| Reliability & privacy | Failure-path tests, local-first records, opt-in tracking and accurate limitations |

Roadmap priorities: broaden reviewed regional playbooks, test current IDE/OS combinations with authorized sessions, improve accessibility-based ATS fallbacks, and strengthen upload/receipt evidence. These are contribution directions, **not promises of scheduled delivery or unattended operation**. See [CONTRIBUTING.md](CONTRIBUTING.md) and [the maintained task roadmap](roadmap.md).

<details>
<summary><strong>Repository map and maintainer verification</strong></summary>

| Path | Purpose |
|---|---|
| `AGENTS.md` | Canonical instructions, execution order and guardrails |
| `skills/`, `prompts/`, `commands/` | Chat-first agent playbooks and portable requests |
| `context/*.example`, `config/` | Synthetic structures, public registry and conservative settings |
| `bin/` | Built-in-only installer/readiness utilities |
| `mcp/` | Canonical public MCP template and private import guidance |
| `templates/` | ATS HTML; generated PDFs/evidence stay in private `logs/resumes/` |
| `schemas/`, `scripts/` | Shared contracts, optional local helpers, validation and tests |
| `demo/` | Synthetic fixtures only |
| `src/` | Retained compatibility preview; not required for the agent product |

```bash
npm run test:cli
npm test
npm run test:agent-rules
npm run validate:logs -- --demo
```

A successful unit test or synthetic PDF does not verify employer submission, actual MCP tool exposure, first login, native IDE command discovery or Notion read-back. Real checks need owner-verified facts, authorized sessions and explicit launch consent. Contributions must state what was and was not tested. Licensed under [MIT](LICENSE).

</details>
