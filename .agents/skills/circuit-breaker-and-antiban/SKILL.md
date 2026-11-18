---
name: circuit-breaker-and-antiban
description: Load before and during Playwright MCP sessions to enforce a 24-hour platform cooldown in logs/circuit-breaker.json the instant any CAPTCHA, Cloudflare/DataDome frame, 429 rate limit, or security banner appears.
---

# Job Hunter Anti-Bot Circuit Breaker

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Follow `skills/24-circuit-breaker-and-antiban.md` to check `logs/circuit-breaker.json` before opening any board and immediately halt + record a 24-hour cooldown on any challenge or rate-limit signal.
