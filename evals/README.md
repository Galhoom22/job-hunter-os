# `evals/` — Deterministic Harness Validator & Reproducible Prompt Suite

> **Important Truthfulness Disclaimer:**
> Running `node ./bin/cli.mjs eval` (or `--baseline`) runs a **deterministic harness validator for CI schema, fixture integrity, and assertion logic against [`results/baseline-verified-run.json`](results/baseline-verified-run.json)** — it is **NOT** a live multi-model benchmark score claiming runtime LLM accuracy.
> To grade an actual external model session, use [`PROMPT.md`](PROMPT.md) and pass its output JSON via `--file <model-output.json>`.

## Directory Contents

- [`RUBRIC.md`](RUBRIC.md) — Exact specification of all **20 assertions (`EVAL-01`..`EVAL-20`)**.
- [`PROMPT.md`](PROMPT.md) — Copy-paste zero-shot evaluation prompt for testing external LLMs (`Claude`, `Gemini`, `GPT`, `DeepSeek`).
- [`fixtures/candidate-profile.md`](fixtures/candidate-profile.md) — Synthetic candidate ground truth (`Alex Rivera`) with permitted numeric metrics and forbidden (`0`-year) skills.
- [`fixtures/jds/`](fixtures/jds/01-strong-match.md) — 5 edge-case job descriptions:
  1. [`01-strong-match.md`](fixtures/jds/01-strong-match.md) (Tier A match + recruiter codeword `PINEAPPLE`)
  2. [`02-prompt-injection-trap.md`](fixtures/jds/02-prompt-injection-trap.md) (adversarial hidden `SYSTEM OVERRIDE`)
  3. [`03-ghost-expired-job.md`](fixtures/jds/03-ghost-expired-job.md) (`>90` days old + closed banner)
  4. [`04-blacklist-duplicate.md`](fixtures/jds/04-blacklist-duplicate.md) (blacklisted company/domain + cross-board duplicate fingerprint)
  5. [`05-stretch-mismatch.md`](fixtures/jds/05-stretch-mismatch.md) (Tier C stack & onsite authorization mismatch)
- [`fixtures/forms/`](fixtures/forms/greenhouse-mock.html) — Self-contained local HTML ATS form mocks (`greenhouse-mock.html`, `lever-mock.html`, `ashby-mock.html`) with file inputs, EEO dropdowns, GDPR checkboxes, and hidden honeypot inputs.
- [`results/baseline-verified-run.json`](results/baseline-verified-run.json) — Static CI reference payload verifying that the 20 grading checks catch regressions.

## Commands

```bash
# CI Schema & Reference Baseline Self-Test
node ./bin/cli.mjs eval --baseline

# Grade an actual external model's JSON output
node ./bin/cli.mjs eval --file logs/exports/eval-output.json
```
