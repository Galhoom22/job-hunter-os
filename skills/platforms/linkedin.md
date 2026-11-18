---
name: linkedin
description: Discover LinkedIn jobs with recent filters, handle Easy Apply, or route approval-only profile/post requests.
---
# LinkedIn playbook

Live UI/tool compatibility: unverified. Labels below are recognition hints, not fixed selectors. Read AGENTS.md and execution-safety.md; permitted use, successful preflight/auth/context, 3–9s waits and fresh snapshots are prerequisites for a daily run.

## Job search and 24h radar
1. Open the configured search after verifying a named account/menu at the auth URL. Use Jobs and search textboxes by current accessible names/refs. Enter confirmed role keywords and location, not template frontend defaults.
2. Open All filters/Date posted if present. Select Past 24 hours, workplace type, experience and job type according to preferences; Easy Apply is optional and not a proxy for fit. Snapshot applied filter chips and resulting count. Missing filter → record limitation, never assert the result is last-24h from an unverified URL parameter.
3. Read each result's job title/detail pane. Capture canonical `/jobs/view/<numeric-id>`, company, location, remote-country restrictions, posted timestamp if actually visible and full description. Preserve `linkedin:<id>` across external redirects. Promoted/reposted/relative dates are not proof of original age; record unknown when unclear.
4. Pause to read the full description (at least 10 seconds for a complete JD, longer as needed) and score against CV. Limit scanning to target.max_results, small scrolls only. Check journal by ID and canonical ATS URL before application. No bulk collection of unrelated profiles/messages.

## Easy Apply multi-step form
1. Inspect Apply's behavior first: a quick/one-click button may be irreversible, so final safety gate must precede it. Only non-submitting Easy Apply opens a modal safely in dry run.
2. Snapshot the modal, heading, progress and required fields. Verify contact defaults belong to the owner. Use fill-form-answers.md; do not trust stale autofill or generic years answers for a specific skill.
3. Select/upload this job's verified tailored PDF; confirm filename in the modal. Resume recommendations/preselected cached files are not automatic authorization.
4. For each Next/Continue snapshot and validate changed fields/errors. Do not loop on a validation error or clear unknown legal fields. Open-ended motivation uses grounded-answer.md; factual/legal missing answers → needs_review, screenshot, leave tab open and ask.
5. At Review verify employer/role, contacts, exact resume, consents and answers. Uncheck Follow company only if safe and preferences.follow_companies is not true; do not change unrelated profile settings.
6. Follow apply-easy-apply.md: dry run stops before any final submission; real run rechecks caps/duplicates, reserves the entry under lock, submits once and requires a receipt identifying the job. Dismissal or button disappearance alone is not proof. Uncertainty remains needs_review, never retry.

## External Apply
Inspect/switch new tabs using actual MCP tab tools. Confirm HTTPS destination/employer, preserve ID and use ats-engines.md / apply-external-ats.md. Unknown host/account creation/manual portal → review. Login/challenge/warning aborts the run, not merely this job.

## Profile optimization and posts
These are separate owner-requested actions, never daily-run side effects. Use linkedin-profile-update.md or linkedin-post.md: grounded exact draft/diff in chat → owner replies approve → fresh snapshot verifies exact content → Save/Post. Any draft change invalidates earlier approval. No automatic engagement, messages, connection invites, posts or profile edits. Report the saved change/post URL only after confirmation; keep private audit steps and validate logs.
