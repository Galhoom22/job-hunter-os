# Blueprint: Portable AI Job Hunter Repository (alignment only, no files yet)

## 1. Shared understanding

The repo has two layers that never call each other directly. They share files on disk.

```text
            You: "Start today's job run"
                        |
        AI IDE agent (Antigravity / Cursor / Claude Code)
          reads: AGENTS.md -> skills/*.md -> context/*
                        |
     +------------------+-------------------+
     |                                      |
 Playwright MCP                         Notion MCP
 (local Chromium, persistent            (applications DB,
  --user-data-dir, cookies stay local)   daily metrics, insights)
     |                                      |
     +---------> writes logs/*.json <-------+
                        |
         Local dashboard (npm run dev, localhost only)
         reads logs + context, edits config files, charts
```

- Skills and playbooks are Markdown instructions. The agent is the runtime. No backend.
- `logs/` and `context/` act as the contract. Agents write JSON that has to pass a schema. The dashboard reads and validates that JSON, and it can edit the config files (targets, form answers).
- Notion is the long-term memory and the place for analytics. Local JSON is the backup that stays true even when Notion is down.
- The dashboard runs on your machine only. It reads files through local server functions (Node filesystem access). It has no auth and no cloud. It is never deployed with real data.

## 2. Proposed folder architecture

```text
/
├─ AGENTS.md                    # canonical agent entrypoint (rules, run order, guardrails)
├─ CLAUDE.md                    # 1-line pointer -> AGENTS.md (Claude Code)
├─ .cursor/rules/job-hunter.mdc # pointer + globs -> AGENTS.md (Cursor)
├─ .agent/workflows/            # Antigravity workflows -> call skills
│   └─ daily-run.md
├─ .mcp.json                    # Claude Code MCP config (playwright + notion)
├─ .cursor/mcp.json             # Cursor MCP config (same servers)
├─ mcp/
│   ├─ mcp.template.json        # single source; script syncs to IDE-specific files
│   └─ README.md                # setup, login-once flow for the browser profile
├─ skills/                      # one capability per file, small and composable
│   ├─ 00-daily-run.md          # orchestrator: preflight -> discover -> score -> apply -> log -> report
│   ├─ discover-jobs.md
│   ├─ score-job.md             # JD vs CV rubric, outputs structured JSON
│   ├─ apply-easy-apply.md
│   ├─ apply-external-ats.md    # Greenhouse/Lever/Workday patterns
│   ├─ fill-form-answers.md
│   ├─ log-application.md       # Notion + local JSON, idempotent
│   ├─ weekly-insights.md
│   ├─ linkedin-profile-update.md  # only runs when you ask for it
│   └─ linkedin-post.md            # draft first, needs your approval
├─ prompts/partials/            # reusable fragments (tone, safety, output formats)
├─ context/                     # your personal data (gitignored except *.example)
│   ├─ profile.md / cv.md
│   ├─ preferences.yaml         # roles, locations, salary floor, blacklist companies
│   ├─ targets.yaml             # search URLs / boards
│   └─ form-answers.yaml        # common question bank
├─ config/
│   └─ guardrails.yaml          # rate limits, daily caps, stop conditions, dry-run
├─ schemas/                     # JSON Schema (and shared Zod) for every file agents write
│   ├─ application.schema.json
│   ├─ run.schema.json
│   └─ job.schema.json
├─ logs/                        # gitignored
│   ├─ applications-log.json
│   ├─ runs/YYYY-MM-DD.json
│   └─ screenshots/
├─ scripts/
│   ├─ validate-logs.ts         # schema check; the agent runs it after each write
│   ├─ sync-mcp.ts              # template -> .mcp.json / .cursor/mcp.json
│   └─ preflight.ts             # profile exists, caps not hit, schemas valid
├─ browser-profile/             # gitignored persistent Chromium user-data-dir
└─ src/                         # the local dashboard (React + Tailwind, dark mode)
    routes: / (overview charts), /applications, /runs, /config (targets + answers editor), /insights
```

## 3. Suggested reliability additions

- **Schema validation:** a single Zod source generates the JSON Schema. Agents run `npm run validate` after each write. The dashboard rejects bad rows and highlights them.
- **Idempotency:** each job gets a stable `job_id` (a hash of platform + posting ID). The agent checks the log before applying, so it never applies twice.
- **Guardrails file:** a cap on applications per day and per platform, random delays, and a stop when it hits a CAPTCHA, a login wall or an unknown required field. A `dry_run` mode scores jobs and fills forms but does not submit.
- **Human-in-the-loop tiers:** auto-submit only above a match-score threshold. Borderline jobs go to a "needs review" queue that you see in the dashboard. Any LinkedIn post or profile edit always needs your approval.
- **Run journal:** each run writes `runs/DATE.json` with steps, errors and screenshots on failure, so you can resume or debug a run.
- **Prompt modularity:** skills stay small and reference shared partials. The orchestrator only sequences them. Each skill has a version header.
- **Secrets hygiene:** the browser profile, context and logs are gitignored, with `.example` files committed. The Notion token lives only in local env or MCP config.
- **Notion fallback:** if a Notion write fails, the agent marks the row `notion_synced: false`. A sync skill retries it later.
- **One canonical AGENTS.md:** the IDE-specific files only point to it, so the three tools can't drift apart.

## Technical notes

- This project runs on TanStack Start. Locally, `npm run dev` gives Node server functions that can read and write `logs/` and `context/` directly. The dashboard is local-first by design. A published build would show only demo data.
- Libraries: Recharts for charts, Zod shared between scripts and the dashboard, `yaml` for config files.

## Next step

Once you approve this blueprint, send the detailed file specs. I'll generate them in batches: agent and IDE config, then skills, then schemas and scripts, then the dashboard.
