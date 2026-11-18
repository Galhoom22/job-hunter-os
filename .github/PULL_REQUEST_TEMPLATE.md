## Summary
Describe the skill, platform playbook, template, or documentation improvement in this PR.

## Checklist
- [ ] **Zero-Code Standard:** No custom CLI scripts, browser extensions, or backend automation code added.
- [ ] **Skill Contract:** New/updated skills include valid YAML frontmatter (`name`, `version`, `description`, `triggers`, `requires_mcp`, `preconditions`, `requires_skills`, `verification`) and the 3 mandatory sections (`When to Use & Preconditions`, `Deterministic Step-by-Step Execution`, `Anti-Patterns (What NEVER To Do) & Self-Verification Check`).
- [ ] **Progressive Disclosure:** `skills/REGISTRY.md` and `skills/skills-manifest.json` updated if skills were added or changed.
- [ ] **Accessibility-First:** Platform/ATS playbooks use `browser_snapshot` roles, labels, and refs (no brittle CSS selectors).
- [ ] **Safety & Privacy:** No real CVs, personal `context/` files, `logs/`, `*.pdf`, `.env`, cookies, or `browser-profile/` included; new `targets.yaml.example` entries ship with `enabled: false`.
- [ ] **CI Verified:** Skill/JSON validation and build checks pass.
