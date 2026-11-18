# Skill: Discover Jobs — v1

Input: one target from `context/targets.yaml` (`platform`, `name`, `url`, `max_results`).
Output: list of `DiscoveredJob` objects (`schemas/index.ts`).

1. `browser_navigate` to `target.url`. Pace per partial.
2. `browser_snapshot`. Find the results list (role `list` near the heading containing "results"/"jobs").
3. For each list item up to `max_results`:
   - Click the job title link (role `link`), wait, snapshot the detail pane.
   - Extract: title, company, location, posted date, workplace type, the full description text, and
     whether a button named "Easy Apply" / "Apply now" (internal) exists → `apply_type: easy_apply`,
     otherwise `external`.
   - `job_id = <platform>:<platform posting id>` (from the URL, e.g. `/jobs/view/4012345678` → `linkedin:4012345678`).
4. Filter using `context/preferences.yaml`:
   - drop `blacklist_companies`, titles containing `exclude_keywords`, locations not in `locations` (unless remote allowed).
5. Scroll (`browser_press_key` "End") for more results only if fewer than `max_results` collected.
6. Return the jobs. Do not apply here.

Platform notes:
- **LinkedIn**: results in left list, details pane on the right; "Easy Apply" badge means internal.
- **Wellfound**: each company card can list several roles; open each role.
- **Wuzzuf**: detail opens in a new page; go back with `browser_navigate_back`.
- **Greenhouse boards**: all jobs are `external` (ATS form on same page).
