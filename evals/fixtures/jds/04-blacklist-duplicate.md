# JD 04 — Blacklisted Employer & Cross-Channel Duplicate

## Case 4A — Blacklisted Domain & Company
- **Company:** ToxicStaffing Global
- **Role:** Senior Node.js Consultant
- **Platform:** `indeed`
- **URL:** `https://toxicstaffing.example/jobs/nodejs-441`
- **Notes:** Matches `blacklisted_companies: ["ToxicStaffing Global"]` and `blacklisted_domains: ["toxicstaffing.example"]`.

## Case 4B — Cross-Channel Canonical Duplicate
- **Company:** Acme Cloud, Inc.
- **Role:** Sr. Backend Engineer (Remote)
- **Platform:** `greenhouse`
- **URL:** `https://boards.greenhouse.io/acmecloud/jobs/55192?utm_source=wellfound`
- **Canonical Fingerprint:** `acme-cloud::senior-backend-engineer` (Already applied via `linkedin-900112` in `logs/applications-log.json`).
