---
name: meta-context-compaction
description: Load every 3-5 applications or when context grows long to checkpoint run state to logs/runs/current-session-checkpoint.json and prune stale browser snapshots.
---

# Job Hunter Context Compaction Meta-Skill

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Follow `skills/meta-context-compaction.md` to persist progress to `logs/runs/current-session-checkpoint.json` so long runs never lose guardrails or state.
