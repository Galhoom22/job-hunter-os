---
name: global-boards
description: Discover and review jobs on Indeed, Glassdoor, Dice and ZipRecruiter without assuming quick-apply is reversible.
---
# Global boards

Live-unverified. Shared preflight/auth/context and platform permission first; fresh snapshots/refs, random 3–9s waits and 10+ second description-reading pauses. Do not automate signup, login challenges, subscriptions or third-party OAuth.

| Platform | Search / identity | Form distinctions |
|---|---|---|
| Indeed | Snapshot What/Where and visible date/remote/job-type filters. Capture canonical posting key from `jk`/verified job link, `indeed:<key>`; repost/estimated salary noted separately | Indeed Apply may be multi-step internal or leave site. Inspect current destination, contacts/autofill and upload. Any profile-change/account flow needs separate owner review. See indeed.md. |
| Glassdoor | Use accessible Jobs search and owner-approved location/date filters; canonical employer posting ID from actual role URL, `glassdoor:<id>` | Salary/reviews and employer ads are not the JD. Login/review-contribution/paywall prompts are blockers, never bypassed; external Apply inspected. See glassdoor.md. |
| Dice | Title/keyword and location search, employment type and remote filters when present; `dice:<verified posting id>` | Read recruiter/employer identity, contract duration, clearance and US authorization requirements explicitly. Generic experience cannot answer clearance/legal screening. External ATS or reviewed internal form only. See dice.md. |
| ZipRecruiter | Snapshot search/list, verify posting ID from job page/link; `ziprecruiter:<id>` | “1-Click Apply” can submit immediately. In dry run never click it; in real run require full final gate/reservation BEFORE click. Saved profile/cached CV is not automatically the current tailored file. See ziprecruiter.md. |

## Per-job procedure
1. Verify named owner auth if required. Snapshot applied filters/result state; never assert a unavailable “last 24h” filter exists.
2. Open full JD, extract employer/title/location/restrictions/date/description and canonical identity. Ratings, estimated pay or promoted labels are separately attributed; unknown fields remain unknown.
3. Score vs verified CV and exclusions. Check journal and canonical ATS destination for duplicates across platforms. Observe bounded results and caps; unsupported identity/form → review.
4. Inspect Apply semantics before clicking; a possible one-click submission invokes final gate first. External recognized host → ATS dispatcher. No automatic account creation, messaging or shared profile modifications.
5. Resolve fields through fill-form-answers.md/grounded-answer.md and upload exact verified per-job PDF. Unknown factual/legal fields or cached-resume mismatch → needs_review, local screenshot, open tab and chat question.
6. Only a permitted final submission, after reservation and fresh checks, may occur once. Verify actual receipt/role, keep uncertain outcome reserved, journal locally and optionally sync Notion. Security/login/rate-limit banners abort the run.
