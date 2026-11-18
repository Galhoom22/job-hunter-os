---
name: on-demand-mcp-routing
version: "1.0.0"
description: Load at phase boundaries to minimize context bloat by routing MCP tool usage strictly on demand — using zero MCP tools for local JSON/Markdown phases (/weekly-report, rejection patterns, score calibration, PII audit) and invoking Playwright MCP or Notion MCP only in the exact browser or sync phases that require them.
triggers:
  - route MCP tools on demand
  - reduce context token bloat in long session
  - phase boundary MCP check
requires_mcp:
  - none
preconditions:
  - active task or /daily-run phase is identified (local file ops, browser automation, or optional Notion sync)
  - config/guardrails.yaml storage_adapters.notion_mcp flag is known
requires_skills:
  - meta-context-compaction
  - daily-run
verification:
  - pure local phases (interrogation gates, CV writing, pattern/calibration analysis, weekly report) executed using IDE file tools with zero unnecessary Playwright/Notion MCP calls
  - Notion MCP calls were skipped cleanly whenever storage_adapters.notion_mcp is false in config/guardrails.yaml
  - Playwright MCP snapshot payloads were pruned/summarized immediately at phase end before checkpointing via meta-context-compaction
---
# On-Demand MCP Tool Routing (Adapted from `obra/superpowers-lab` `mcp-cli` Pattern)

## When to Use & Preconditions

Prevents accessibility-tree snapshots and optional integration schemas from exhausting model context during multi-application runs, keeping latency low and reasoning crisp across every model family.

- **Load when:** `route MCP tools on demand`; `reduce context token bloat in long session`; `phase boundary MCP check`.
- **Preconditions (stop if any is false):**
  - current workflow phase is known
  - `config/guardrails.yaml` is readable
- **Requires skills:** `meta-context-compaction`, `daily-run`. **MCP:** none (routing controller).

## Deterministic Step-by-Step Execution

1. **Classify the Current Phase Before Touching Any MCP Tool:**
   - **Local-Only Phases (Zero MCP Calls):**
     - Gatekeeper audit (`00-interrogate-and-onboard`), pasted/Markdown CV ingestion (`01`), HTML tailoring & fact-checking (`03` pre-PDF step), local interview dossier & `<= 75`-word drafts (`05`), local JSON writes & `/weekly-report` (`06`), persona switching (`07`), follow-up radar (`08`), offer negotiation (`09`), PII audit (`14`), rejection patterns (`16`), and score calibration (`17`).
     - Execute these strictly with built-in file read/write tools.
   - **Playwright-Required Phases (`requires_mcp: playwright`):**
     - Auth check, search page inspection, full JD reading, HTML->PDF export (`page.pdf`), ATS form upload/fill, Company due diligence (`13`), and GitHub/Portfolio link inspection (`11`).
     - Invoke Playwright MCP only during these discrete windows.
   - **Notion-Required Phases (`requires_mcp: notion`):**
     - Check `config/guardrails.yaml` -> `storage_adapters.notion_mcp`. If `false` (default), **never load or call Notion MCP tools**; write local JSON under `logs/` only.
2. **Keep Snapshot Surface Lean Across Phases:**
   - Once a JD is captured via `browser_snapshot`, distill its key facts into the working Mission Control entry or `interview-dossier.md` and discard raw HTML/navigation boilerplate from working memory.
   - Every **3–5 applications**, execute `skills/meta-context-compaction.md` to checkpoint progress and drop stale tab trees.
3. **Graceful Degradation Check (`fallback-no-mcp`):**
   - If the active harness does not have `playwright` connected when a browser phase begins, stop gracefully and route to `skills/fallback-no-mcp.md` instead of retrying missing MCP tools or fabricating browser output.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

- **NEVER** open Playwright MCP just to read a Markdown CV file (`context/cv.md`) or count rows in `logs/applications-log.json`.
- **NEVER** attempt Notion MCP calls when `storage_adapters.notion_mcp: false`.
- **NEVER** keep 10 full raw `browser_snapshot` trees verbatim in active conversation reasoning when summarizing past jobs.
- **Self-Verification Check:** Confirm pure local phases used zero MCP calls, Notion MCP was skipped when disabled, and any MCP error triggers clean routing (`fallback-no-mcp` or `meta-dom-recovery`) within the 3-error limit.
