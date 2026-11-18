# Skill: LinkedIn Profile Update (on demand only) — v1

Never run during a daily run. Only when the owner asks.
Use skills/profile-optimizer.md for a current/proposed evidence table and MCP/extension staging. Exact-text approval is mandatory; the extension never saves. Read back persisted changes before claiming success.

1. Ask which section: Headline, About, Experience entry, Skills.
2. Draft the new text from `context/profile.md` + latest insights. Show it in chat as a diff (old → new).
3. **Wait for the owner to reply "approve".** Anything else = revise or stop.
4. Navigate to `https://www.linkedin.com/in/me/`, snapshot, click the pencil button for the section (accessible name contains "Edit").
5. Replace the text field contents, snapshot to verify, then click "Save" — only after approval.
6. Log the change in `logs/runs/<today>.json -> steps` as `linkedin_profile_update`.
