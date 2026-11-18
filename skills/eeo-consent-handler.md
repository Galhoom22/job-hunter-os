---
name: eeo-consent-handler
version: "1.0.0"
description: Load when an ATS form displays voluntary EEO/demographics fields, referral source dropdowns, or GDPR/privacy policy consent checkboxes; maps owner-verified eeo_and_compliance_defaults safely without ticking marketing opt-ins.
triggers:
  - EEO or voluntary self-identification section in ATS form
  - referral source ("How did you hear about us?") field
  - GDPR / privacy policy consent checkbox at form bottom
requires_mcp:
  - playwright
preconditions:
  - owner-verified context/form-answers.yaml loaded with eeo_and_compliance_defaults or eeo
  - fresh browser_snapshot showing exact field labels and checkbox/dropdown options
requires_skills:
  - fill-form-answers
verification:
  - EEO fields selected the owner's configured default or neutral opt-out option ("Decline to self-identify" / "Prefer not to say")
  - GDPR/privacy policy consent checked only when gdpr_privacy_consent is true and it is a required processing notice, never marketing/newsletter opt-ins
  - unknown or non-neutral compliance questions were left unfilled and routed to needs_review
---
# EEO, Demographics & Consent Auto-Handler

## When to Use & Preconditions

Use whenever Greenhouse, Lever, Ashby, SmartRecruiters, or other ATS forms present voluntary Equal Employment Opportunity (EEO), demographic self-identification, referral source, or GDPR privacy consent controls.

- **Load when:** EEO or voluntary self-identification section in ATS form; referral source (`"How did you hear about us?"`) field; GDPR / privacy policy consent checkbox at form bottom.
- **Preconditions (stop if any is false):**
  - owner-verified `context/form-answers.yaml` loaded with `eeo_and_compliance_defaults` or `eeo`
  - fresh `browser_snapshot` showing exact field labels and checkbox/dropdown options
- **Requires skills:** `fill-form-answers`. **MCP:** playwright.

## Deterministic Step-by-Step Execution

1. **Read `eeo_and_compliance_defaults` from verified `context/form-answers.yaml`:**
   - Expected keys:
     - `gender` (default: `"Decline to self-identify"`)
     - `ethnicity` (default: `"Decline to self-identify"`)
     - `veteran_status` (default: `"Decline to self-identify"` / `"I am not a protected veteran"` if specified)
     - `disability_status` (default: `"Prefer not to say"` / `"I do not wish to answer"`)
     - `referral_source` (default: `"LinkedIn"` or `"Company Careers Page"`)
     - `gdpr_privacy_consent` (`true` or `false`)
   - Fall back to legacy `eeo` keys (`gender`, `ethnicity`, `veteran`, `disability`) if `eeo_and_compliance_defaults` is not set.
2. **Map voluntary EEO / demographic dropdowns & radios:**
   - Inspect the exact option labels in the fresh `browser_snapshot`.
   - Match the owner's configured value; if the portal uses a slightly different opt-out phrasing (e.g., `"Prefer not to say"`, `"I don't wish to answer"`, `"Decline to self-identify"`, `"Decline to answer"`), select the exact neutral opt-out option unless the owner explicitly provided a specific demographic value in `context/form-answers.yaml`.
   - Never guess or invent a demographic identity if the owner left it blank and no opt-out option exists → record in `open_questions` and `needs_review`.
3. **Map referral source (`"How did you hear about us?"`):**
   - Select the option matching `referral_source` (or the actual discovery channel, e.g., `"LinkedIn"`, `"Job Board"`, `"Company Website"`).
   - If the field is a required free-text input and asks `"Referred by (employee name)?"`, leave empty if optional or ask owner if required—never invent a referral name.
4. **Handle GDPR / Privacy Policy consent vs marketing checkboxes:**
   - Distinguish **required privacy/data-processing consent** (e.g., `"I have read and agree to the Privacy Policy / Candidate Data Notice"`) from **optional marketing/talent-pool opt-ins** (e.g., `"Send me future job alerts"`, `"Subscribe to company newsletter"`, `"Follow company"`).
   - Only check the required privacy policy / GDPR consent box when `eeo_and_compliance_defaults.gdpr_privacy_consent: true` AND the checkbox is strictly for application data processing.
   - Leave optional marketing, newsletter, and `"Follow company"` checkboxes **unchecked** unless the owner explicitly opted in.
5. **Re-snapshot to confirm:**
   - Wait 3–9 s between actions and take a fresh `browser_snapshot` confirming every selected EEO option, referral source, and consent checkbox state before proceeding to `skills/approval-gate.md`.

## Anti-Patterns (What NEVER To Do) & Self-Verification Check

### Anti-patterns
- ❌ Guessing a demographic answer when no opt-out option is obvious → ✅ record `open_questions` and ask the owner.
- ❌ Checking `"Subscribe to marketing emails"` alongside the GDPR privacy notice → ✅ check only required candidate data-processing consent when `gdpr_privacy_consent: true`.
- ❌ Inventing an employee referral name in `"How did you hear about us?"` → ✅ use `referral_source` (e.g., `"LinkedIn"`).

### Self-verification check (before reporting this step complete)
- [ ] EEO fields selected the owner's configured default or neutral opt-out option (`"Decline to self-identify"` / `"Prefer not to say"`)
- [ ] GDPR/privacy policy consent checked only when `gdpr_privacy_consent` is `true` and it is a required processing notice, never marketing/newsletter opt-ins
- [ ] unknown or non-neutral compliance questions were left unfilled and routed to `needs_review`

Evidence comes from a fresh snapshot, a file read or a command exit code observed after the action (skills/meta-self-verification.md). If any box cannot be ticked, report the step as unverified or needs_review — never as done.
