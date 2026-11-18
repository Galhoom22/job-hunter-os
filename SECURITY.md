# Local-first privacy & security

## What stays local
Browser cookies/profile, base and tailored resumes, real context, application history and exports are ignored by Git. Generated MCP configs and .env stay private. Hosted dashboards bundle synthetic demo data only and have no personal filesystem access. No built-in remote telemetry or model calls are used by the resume renderer/export helpers.

**Local-first is not “nothing ever leaves your machine.”** Applications necessarily send selected personal facts and resumes to employers/job boards. Enabling optional Notion sends selected records to Notion. Your chosen AI IDE/model may process files under its own privacy policy. Never grant tools access you do not intend. Use local/offline models where that is a requirement.

Gitignore prevents accidental new additions, not forced git adds, backups, malware or previously committed history. Earlier commits contain synthetic examples; if real secrets were ever committed, rotate them. Never share personal artifacts in issues, public PRs or screenshots.

## Defensive defaults
Dry run, verified facts only, score >=7 eligibility, duplicate checks, pending-receipt reservations, warm-up caps and configured active hours. CAPTCHA/2FA/unusual security warnings stop immediately. No anti-detection, concealment, stealth plugins or bypass. Delays/cooldowns reduce request volume but cannot guarantee an account will not be restricted.

Local dashboard editing is development-only; bind it to loopback and do not expose via public tunnels. MCP tools have powerful browser/filesystem access: approve permissions carefully. Resume rendering blocks network requests and escapes text. CSV exports neutralize spreadsheet formula prefixes.

## Reporting a vulnerability
Use GitHub private vulnerability reporting on the repository Security tab when enabled. Otherwise contact the maintainer privately through their verified GitHub profile; do not publish secrets or an exploitable report in an issue. No invented support address. Include affected version, minimal redacted reproduction and impact.
