# Contributing to job-hunter-os

Improve the **chat + skills + MCP playbooks**, not the compatibility web preview. Submit focused Markdown, prompts, templates, MCP guidance and safety-contract changes. Leave `src/` untouched for this product direction.

## Add or improve a board
1. Copy [skills/platforms/_template.md](skills/platforms/_template.md). Describe triggers, supported host/canonical IDs, auth indicators, snapshot-driven filters, resume chooser, consent, final-submit semantics, receipt and recovery.
2. Prefer fresh accessibility snapshots and actual roles/labels/refs. Do not ship brittle CSS recipes or claim fixed labels always exist. Cover the board's distinctive workflow; refer to shared safety skills rather than copying them.
3. Add a registry entry. A documentation-only/unknown platform uses `other` with cap 0 and manual review. To enable automatic submission, also add its contract key, disabled target example, explicit cap and meaningful safety test. Never enable targets by default.
4. Record tested date, tool version, authorized environment and limitations, or explicitly mark live-unverified. Do not fabricate employer applications, receipts or screenshots as evidence.

## Skills and workflow entries
Give each new skill a trigger/input description, ordered steps, observable success and blocker handling. Reference AGENTS.md for invariants. Keep five command entrypoints synchronized through docs/chat-commands.md; native slash registration is version-dependent. Never duplicate secret-bearing MCP files: mcp/mcp.template.json is canonical.

## Resume templates and truth
Single-column semantic HTML, escaped facts, no scripts/remote assets/hidden keywords. Rewrites must preserve evidence, dates, scope and achievements. Missing legal/factual answers are blockers, not generative-writing tasks. Test rules with concrete values, not prose or markup snapshots.

## Validation
Use Node 22+ and `npm install` for helper development. Run `npm test`, `npm run test:agent-rules`, and `npm run validate:logs -- --demo`; new non-frontend safety tests belong under scripts/tests/ with its isolated configuration. Use synthetic temporary fixtures only. Check relative Markdown links and keep referenced files in the same PR.

Real browser testing needs owner-authorized sessions and platform permission. No stealth plugins, CAPTCHA/2FA solving, automatic account creation, or unapproved LinkedIn writes. Delay rules limit volume and do not guarantee immunity from restrictions.

Never include real CVs, contacts, application logs, browser profiles, tokens, screenshots or generated configs in a commit/issue. Review staged files and ignore rules; forced adds bypass protection. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).
