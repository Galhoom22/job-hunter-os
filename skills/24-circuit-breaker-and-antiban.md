---
name: circuit-breaker-and-antiban
version: "1.0.0"
description: Load before and during any Playwright MCP browser interaction to detect anti-bot challenges (CAPTCHA, Cloudflare, DataDome, Arkose, HTTP 429/403, unusual-activity banners, or forced login redirects), immediately trip a 24-hour platform cooldown in logs/circuit-breaker.json, and halt browser actions without retry loops.
triggers:
  - circuit breaker check before platform navigation
  - CAPTCHA / Cloudflare / DataDome / Arkose challenge detected
  - unusual activity or HTTP 429 / 403 rate limit banner
  - unexpected mid-run login redirect
requires_mcp:
  - playwright
preconditions:
  - Playwright MCP session is active or about to open an enabled platform from context/targets.yaml
  - logs/ directory is writable for reading and updating logs/circuit-breaker.json
requires_skills:
  - meta-dom-recovery
  - log-and-insights
verification:
  - active cooldowns in logs/circuit-breaker.json were checked BEFORE navigating to any platform
  - upon any trip condition, all actions on that platform stopped immediately with zero retry or bypass attempts
  - 24-hour cooldown entry (tripped_at, cooldown_until, trigger_signal, url) was persisted to logs/circuit-breaker.json and reported to the owner
---
# Anti-Bot Circuit Breaker & 24-Hour Session Cooldown

## When to Use & Preconditions

Protects the owner's LinkedIn, Wellfound, Wuzzuf, and ATS accounts from automated lockouts or shadowbans by tripping a hard 24-hour platform circuit breaker the instant any anti-bot or rate-limit signal appears.

- **Load when:** `circuit breaker check before platform navigation`; `CAPTCHA / Cloudflare / DataDome / Arkose challenge detected`; `unusual activity or HTTP 429 / 403 rate limit banner`; `unexpected mid-run login redirect`.
- **Preconditions (stop if any is false):**
  - Playwright MCP session is active or about to open an enabled target
  - `logs/` directory is readable/writable
- **Requires skills:** `meta-dom-recovery`, `log-and-insights`. **MCP:** `playwright`.

## Deterministic Step-by-Step Execution

1. **Pre-Flight Cooldown Check (`logs/circuit-breaker.json`):**
   - Before opening any platform URL in Playwright MCP, read `logs/circuit-breaker.json` (if present).
   - If the target `platform` has an entry with `status: "tripped"` and `cooldown_until > now_utc`, **skip that platform completely**, inform the owner in chat (`"⏸️ Skipping <platform> — circuit breaker active until <cooldown_until>"`), and move to the next non-tripped platform.
2. **Continuous Trip-Condition Detection on Every `browser_snapshot`:**
   - Immediately trip the circuit breaker if ANY of the following appear in `browser_snapshot`, page title, or URL:
     - **Challenge Frames & Gates:** `CAPTCHA`, `reCAPTCHA`, `hCaptcha`, `Cloudflare Turnstile`, `Just a moment...`, `DataDome`, `Arkose Labs`, `PerimeterX`, `Press and hold`.
     - **Security & Rate-Limit Banners:** `"Unusual activity detected"`, `"Verify you are human"`, `"Temporary restriction"`, `"Too Many Requests"`, `HTTP 429`, `HTTP 403 Forbidden`, `"We've noticed some unusual activity on your account"`.
     - **Session Revocation / Forced Logout:** Mid-session redirect to `/login`, `/checkpoint/challenge`, or `/authwall` after authentication was already verified in Step 1.
3. **Immediate Trip Protocol (Zero Retries):**
   - **STOP** all clicks, typing, scrolling, or reloads on that platform immediately.
   - Write or update `logs/circuit-breaker.json` with a 24-hour lock:
     ```json
     {
       "platforms": {
         "linkedin": {
           "status": "tripped",
           "tripped_at": "2026-11-18T18:00:00Z",
           "cooldown_until": "2026-11-19T18:00:00Z",
           "trigger_signal": "Unusual activity / checkpoint challenge redirect",
           "url": "https://www.linkedin.com/checkpoint/challenge/"
         }
       }
     }
     ```
   - Leave the browser tab open without touching the challenge, log the run/platform status as `aborted` (`reason: "circuit_breaker_tripped"`), and alert the owner in chat so they can inspect the browser manually after resting the account.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

- **NEVER** click `"Verify you are human"` checkboxes, solve image/audio puzzles, or refresh a page hoping a 429/CAPTCHA disappears.
- **NEVER** clear cookies, rotate user-agents, or inject stealth scripts to evade a tripped platform check.
- **NEVER** resume a tripped platform before `cooldown_until` expires unless the owner explicitly resets `logs/circuit-breaker.json` after verifying account health.
- **Self-Verification Check:** Confirm `logs/circuit-breaker.json` was checked prior to navigation, zero clicks occurred after a challenge signal, and any trip event persisted a valid 24-hour `cooldown_until` ISO timestamp.
