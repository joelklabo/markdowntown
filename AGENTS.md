# Agent Plugins (concept)

MarkdownTown will support **Agents** that can generate or transform section content on demand. The current codebase only defines the `Agent` model; execution hooks are **not implemented yet**.

## Proposed shape
- Each Agent row stores `name`, optional `description`, and a JSON `config`.
- Agents can be attached to a `Section` (`section.agentId`).
- When executed, an agent receives the section content and returns markdown that is written back to the section.

## Minimal execution contract (implemented as a helper)
See `src/lib/agents.ts`:
```ts
export type AgentContext = {
  userId?: string;
  sections: { id: string; title: string; content: string }[];
};

export type AgentPlugin = {
  id: string;
  name: string;
  description?: string;
  run: (ctx: AgentContext) => Promise<string> | string;
};

// Sample agent
export const sampleAgent: AgentPlugin = {
  id: "sample-agent",
  name: "Sample Agent",
  description: "Returns a summary list of section titles.",
  run: ({ sections }) =>
    sections.map((s, i) => `${i + 1}. ${s.title || "Untitled"}`).join("\\n"),
};
```

## Next steps
1) Add a registry so the backend can map `agentId` -> runtime implementation.
2) Add an API route `/api/sections/{id}/run-agent` to trigger execution.
3) Provide a sample agent (e.g., heading normalizer) that works without external APIs.
