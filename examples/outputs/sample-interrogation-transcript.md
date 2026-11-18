# Readiness Interrogation Transcript (Sample Output)

> **User:** `/daily-run`
>
> **Agent:** Applications are hard-blocked until all 5 readiness gates pass against verified files in `context/`:
> - ❌ **Gate 1 · CV & Profile:** `context/profile.md` still contains `.example` placeholder text.
> - ❌ **Gate 2 · Target Strategy:** `context/preferences.yaml` has no owner-confirmed roles or regions.
> - ❌ **Gate 3 · Terms & Legal:** `context/form-answers.yaml` has `owner_verified: false`.
> - ❌ **Gate 4 · Skills Matrix:** Exact hands-on years are unconfirmed.
> - ❌ **Gate 5 · Platforms:** No target in `context/targets.yaml` is enabled (`enabled: true`).
>
> Let's resolve this in quick 4-question batches. **Batch 1:**
> 1. Share or paste your real CV (or drop `assets/resume.pdf`).
> 2. What target roles and seniority are you aiming for?
> 3. What work modes (`Remote` / `Hybrid` / `Onsite`), allowed regions, and timezone apply?
> 4. Any blacklisted companies or role keywords to exclude?
>
> **User:** *[Pastes CV]* Senior Full-Stack & AI Engineer, Remote worldwide or EMEA (Cairo UTC+2), no company blacklist.
>
> **Agent:** Extracted your verified CV facts into a draft Fact Table (zero metrics or dates inferred). **Batch 2:**
> 1. Minimum acceptable compensation (amount, currency, hourly/monthly/annual)?
> 2. Notice period and earliest start date (`YYYY-MM-DD`)?
> 3. Countries where you hold work authorization, and where do you need visa sponsorship?
> 4. Exact hands-on years for your extracted core skills: TypeScript, React, Node.js, PostgreSQL, Python, Playwright?
>
> **User:** 4,500 USD/month gross (or 55 USD/hour B2B), 30 days notice (earliest 2026-12-18), Egypt work authorization / visa sponsorship needed for US/EU onsite; TypeScript 6, React 5, Node.js 5, PostgreSQL 5, Python 3, Playwright 2.
>
> **Agent:** Saved your confirmed answers to `context/profile.md`, `context/cv.md`, `context/resume-data.json`, `context/preferences.yaml`, and `context/form-answers.yaml` (`owner_verified: true`). **Final Batch:**
> 1. Confirm EEO & GDPR defaults (`Decline to self-identify` / `Prefer not to say`, `referral_source: LinkedIn`, `gdpr_privacy_consent: true`)?
> 2. Which platforms in `context/targets.yaml` should I enable?
> 3. May I open Playwright MCP (`./browser-profile`) in headed mode so you can sign in privately?
>
> **User:** Defaults look good. Enable Greenhouse and LinkedIn, and I have signed in via the browser window.
>
> **Agent:** All 5 gates ✅.
> **Mission Briefing:** Senior Full-Stack & AI Engineer (Remote EMEA/Worldwide), Greenhouse + LinkedIn, Days 1–3 warm-up cap **5/day**, min score **7**, **`dry_run: ON`**. Confirm to launch?
