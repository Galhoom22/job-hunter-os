# Skill: Weekly & Monthly Insights — v1

Trigger: "Generate weekly insights" / "monthly insights" (or automatically on Mondays / 1st of month at the end of a daily run).

1. Load `logs/applications-log.json`; filter by period (last 7 or 30 days on `discovered_at`).
2. Compute:
   - scanned, applied, needs_review, match rate = applied / scanned
   - avg match score, per platform breakdown
   - top 10 demanded skills = frequency of (matched_skills ∪ missing_skills)
   - top skill gaps = frequency of missing_skills
3. Write 3–5 concrete CV / learning recommendations tied to the gaps (e.g. "Add Kubernetes project: appears in 38% of scored roles").
4. Save `logs/insights/<type>-<period>.json` (`Insight` schema) and run `npm run validate:logs`.
5. Create a page in Notion **Weekly & Monthly Insights**. Report a summary in chat.
