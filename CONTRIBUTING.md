# Contributing to job-hunter-os

`job-hunter-os` is a **100% zero-code Markdown skills, templates, and MCP playbook repository**. Submit focused Markdown playbooks, YAML/JSON examples, HTML templates, and MCP documentation—never add custom application backends, runtime scripts, or browser extensions.

## Add or improve a board
1. Copy [`skills/platforms/_template.md`](skills/platforms/_template.md). Describe triggers, supported host/canonical IDs, auth indicators, accessibility-snapshot filters, resume upload, consent, final-submit semantics, receipt verification, and recovery.
2. Always use `browser_snapshot` roles, accessible names, and refs—never brittle CSS selectors.
3. Add a disabled (`enabled: false`) synthetic example entry in `context/targets.yaml.example` and register the playbook in `skills/REGISTRY.md` and `skills/skills-manifest.json`.
4. Mark live UI compatibility accurately (`UNVERIFIED` until tested in an authorized session). Never fabricate employer receipts or screenshots.

## Skills and progressive disclosure
- Every skill in `skills/` must include YAML frontmatter (`name`, `version`, `description`, `triggers`, `requires_mcp`, `preconditions`, `requires_skills`, `verification`) and the three mandatory body sections (`## When to Use & Preconditions`, `## Deterministic Step-by-Step Execution`, `## Anti-Patterns (What NEVER To Do) & Self-Verification Check`).
- Keep `skills/REGISTRY.md` and `skills/skills-manifest.json` updated whenever adding or editing a skill.
- Never duplicate secret-bearing MCP configs: `mcp/mcp.template.json` is canonical.

## Resume templates and truth
- Single-column semantic HTML (`templates/ats-resume-template.html`, `templates/ats-cover-letter-template.html`), escaped facts, zero scripts/remote assets/hidden keywords.
- Tailoring must preserve verified dates, employers, metrics, and skills (`skills/03-tailor-resume-and-verify.md`).

## Privacy & safety
- Real browser testing needs owner-authorized sessions and platform permission. No stealth plugins, CAPTCHA/2FA solving, or unapproved LinkedIn writes.
- Never commit real CVs, contacts, `logs/`, `browser-profile/`, tokens, screenshots, or `.env`. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).
