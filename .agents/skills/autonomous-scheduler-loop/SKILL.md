---
name: autonomous-scheduler-loop
description: Load when configuring or running recurring /loop or scheduled discovery & triage checks within active_hours while preserving warm-up caps and approval gates.
---

# Job Hunter Scheduled Loop Runner

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Follow `skills/10-autonomous-scheduler-loop.md` to run scheduled discovery/triage strictly inside `active_hours`, respecting `warmup_mode` and pausing before any unapproved submission.
