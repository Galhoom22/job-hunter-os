# Model Tuning Guide — DeepSeek, Qwen, Llama, Mistral & Local Ollama

Optimized for **DeepSeek (V3 / R1)**, **Qwen**, **Llama**, **Mistral**, and local **Ollama** / LM Studio models with tighter context windows or stricter tool-calling budgets.

## 1. Ultra-Lean Progressive Disclosure
- **Never** read more than **3 files at once**:
  1. `AGENTS.md` (Hard Guardrails)
  2. `skills/REGISTRY.md` (routing index)
  3. The **single** active `skills/*.md` file for the current step.
- Drop completed skill files and old job descriptions from working memory as soon as you finish each step. Run `skills/meta-context-compaction.md` after every **3 applications** (`logs/runs/current-session-checkpoint.json`).

## 2. Explicit `ref` ID Quoting (Zero Hallucinated Clicks)
Before calling `browser_click`, `browser_type`, `browser_select_option`, or `browser_file_upload`, quote the exact node from the **most recent** `browser_snapshot` in your reasoning:

```text
Target: button "Submit application" [ref=e42] from snapshot taken at 10:14:02Z
```

- Never reuse a `ref` from an earlier step, modal, or tab (`skills/meta-dom-recovery.md`).
- If a target control is missing from the snapshot, take at most 2 bounded scroll/expand recovery steps before marking `needs_review`.

## 3. Minimal Safe Action Loop
- One browser action -> wait 3–9 s -> fresh `browser_snapshot` -> verify state change.
- If uncertain about any legal/salary question or submit outcome, stop immediately, save a screenshot to `logs/screenshots/<job_id>.png`, log `needs_review`, and ask the owner in chat.
