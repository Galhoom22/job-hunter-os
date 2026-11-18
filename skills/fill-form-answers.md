# Skill: Fill Form Answers — v1

Input: a field's label, type and options. Output: value or `UNKNOWN`.

Resolution order:
1. Exact/fuzzy match against `context/form-answers.yaml -> questions[].match` (case-insensitive, any keyword).
2. Profile facts from `context/profile.md` (contact, years of experience, location, notice period).
3. Numeric "years of experience with X": use `form-answers.yaml -> skills_years[X]`; not listed → `UNKNOWN`.
4. Select/radio: choose the option that equals or best matches the resolved value; no fit → `UNKNOWN`.

Never:
- invent numbers, salaries, certifications, or legal statuses;
- answer "Yes" to a yes/no just to pass a filter.

When `UNKNOWN`: record `{question, field_type, options}` in the application's `open_questions`, so the owner can add it to `form-answers.yaml` (the dashboard Config page edits this file).
