<!-- partial: pacing v1 -->
Before every navigation, click, type or selection, wait a random number of seconds within
`config/guardrails.yaml -> human_behavior.action_delay_seconds` (3–9), using the actual exposed MCP wait tool.
The legacy delay_seconds field is compatibility-only, not the agent's action range.

Also pace uploads and scrolls. Scroll modestly only to reveal needed results, then snapshot. Delays reduce load; they do not authorize automation or evade site defenses.

Prefer human_behavior.action_delay_seconds; every max_consecutive_actions pause at least cooldown_seconds (60s). Check active hours before acting. No concealment/evasion.
