# Agent Plugins (concept)

MarkdownTown will support **Agents** that can generate or transform section content on demand. The current codebase only defines the `Agent` model; execution hooks are **not implemented yet**.

## Proposed shape
- Each Agent row stores `name`, optional `description`, and a JSON `config`.
- Agents can be attached to a `Section` (`section.agentId`).
- When executed, an agent receives the section content and returns markdown that is written back to the section.

## Minimal execution contract (to be implemented)
```ts
type AgentRuntime = (input: {
  sectionId: string;
  content: string;
  config: Record<string, unknown>;
}) => Promise<{ content: string }>;
```

## Next steps
1) Add a registry so the backend can map `agentId` -> runtime implementation.
2) Add an API route `/api/sections/{id}/run-agent` to trigger execution.
3) Provide a sample agent (e.g., heading normalizer) that works without external APIs.
