<!-- partial: pacing v1 -->
Before every `browser_navigate`, `browser_click`, `browser_type` or `browser_select_option`, wait a random
number of seconds within `config/guardrails.yaml -> delay_seconds` (default 3–8) using `browser_wait_for` with `time`.

Also pace uploads and scrolls. Scroll modestly only to reveal needed results, then snapshot. Delays reduce load; they do not authorize automation or evade site defenses.
