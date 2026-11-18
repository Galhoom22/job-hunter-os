---
name: deduplication-and-blacklist-guard
description: Load during discovery and before applying to block blacklisted companies/domains and enforce cross-channel canonical job fingerprinting (company::role_title) across boards.
---

# Job Hunter Deduplication & Blacklist Guard

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Follow `skills/26-deduplication-and-blacklist-guard.md` to check `blacklisted_companies` and `blacklisted_domains` in `context/preferences.yaml` and verify `normalize(company)::normalize(role_title)` against `logs/applications-log.json`.
