---
name: on-demand-mcp-routing
description: Load at workflow phase boundaries to route Playwright and Notion MCP calls strictly on demand and keep local JSON/Markdown tasks fast with minimal token overhead.
---

# Job Hunter On-Demand MCP Routing

1. Read `AGENTS.md` and `skills/REGISTRY.md` first.
2. Follow `skills/19-on-demand-mcp-routing.md` to avoid invoking MCP tools during pure local operations, gate Notion calls behind `config/guardrails.yaml`, and compact raw Playwright snapshots between phases.
