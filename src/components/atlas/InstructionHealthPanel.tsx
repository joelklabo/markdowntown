"use client";

import { CopyButton } from "@/components/atlas/CopyButton";
import { PathChip } from "@/components/atlas/PathChip";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import type { InstructionDiagnostic, InstructionDiagnostics, SimulatorToolId } from "@/lib/atlas/simulators/types";
import Link from "next/link";

const severityOrder: Record<InstructionDiagnostic["severity"], number> = {
  error: 0,
  warning: 1,
  info: 2,
};

const severityTone: Record<InstructionDiagnostic["severity"], "danger" | "warning" | "info"> = {
  error: "danger",
  warning: "warning",
  info: "info",
};

const severityLabel: Record<InstructionDiagnostic["severity"], string> = {
  error: "Error",
  warning: "Warning",
  info: "Note",
};

type InstructionTemplate = {
  id: string;
  label: string;
  path: string;
  content: string;
};

type InstructionTemplateMap = {
  root: InstructionTemplate;
  scoped: InstructionTemplate;
  override?: InstructionTemplate;
};

const TEMPLATE_LIBRARY: Record<SimulatorToolId, InstructionTemplateMap> = {
  "codex-cli": {
    root: {
      id: "codex-root",
      label: "AGENTS.md (root)",
      path: "AGENTS.md",
      content: `# Example: \`AGENTS.md\`

## Your job
1. Pick a ready issue.
2. Set it to \`in_progress\`.
3. Implement the change.
4. Run tests and lint.
5. Mark the issue \`done\`.

## Conventions
- Prefer \`rg\` for searching.
- Use \`pnpm\` for scripts.
- Keep commits focused and descriptive.
`,
    },
    scoped: {
      id: "codex-scoped",
      label: "AGENTS.md (scoped)",
      path: "src/AGENTS.md",
      content: `# Example: scoped \`AGENTS.md\`

These instructions apply to files in this folder.

- Keep changes tight and scoped to this directory.
- Prefer local utilities over new shared abstractions.
`,
    },
    override: {
      id: "codex-override",
      label: "AGENTS.override.md",
      path: "AGENTS.override.md",
      content: `# Example: \`AGENTS.override.md\`

This file replaces \`AGENTS.md\` in the same directory.

- Use this when you want different instructions for a subfolder.
`,
    },
  },
  "claude-code": {
    root: {
      id: "claude-root",
      label: "CLAUDE.md (root)",
      path: "CLAUDE.md",
      content: `# Example: \`CLAUDE.md\`

Use this file to provide repository instructions to Claude Code.

## Engineering
- Prefer minimal changes and clear naming.
- Add tests for new behavior.
- Keep performance in mind; avoid unnecessary work in render paths.

## Commands
- Install: \`pnpm install\`
- Test: \`pnpm test\`
- Lint: \`pnpm lint\`
- Type-check: \`pnpm type-check\`
`,
    },
    scoped: {
      id: "claude-scoped",
      label: "CLAUDE.md (scoped)",
      path: "src/CLAUDE.md",
      content: `# Example: scoped \`CLAUDE.md\`

These instructions apply to this directory only.

- Focus on module-local changes.
- Document new utilities with clear comments.
`,
    },
  },
  "gemini-cli": {
    root: {
      id: "gemini-root",
      label: "GEMINI.md (root)",
      path: "GEMINI.md",
      content: `# Example: \`GEMINI.md\`

Use this file to provide project guidance to the Gemini CLI.

## Preferences
- Keep changes small and well-scoped.
- Prefer explicit imports and clear types.
- Run \`pnpm test\` before finalizing.

## Output
- Provide file paths and commands.
- Avoid long explanations unless asked.
`,
    },
    scoped: {
      id: "gemini-scoped",
      label: "GEMINI.md (scoped)",
      path: "src/GEMINI.md",
      content: `# Example: scoped \`GEMINI.md\`

These instructions apply to this folder.

- Keep module changes local.
- Avoid cross-package refactors unless requested.
`,
    },
  },
  "copilot-cli": {
    root: {
      id: "copilot-cli-root",
      label: "copilot-instructions.md (root)",
      path: ".github/copilot-instructions.md",
      content: `# Example: \`.github/copilot-instructions.md\`

Use this file to tell GitHub Copilot how to work in your repo.

## Working agreement
- Prefer small, reviewable diffs.
- Fix root causes; avoid band-aids.
- Run tests and linters before proposing changes.

## Project conventions
- Package manager: \`pnpm\`
- Tests: \`pnpm test\`
- Type-check: \`pnpm type-check\`
- Lint: \`pnpm lint\`

## Output style
- Be concise, direct, and actionable.
- When unsure, ask clarifying questions rather than guessing.
`,
    },
    scoped: {
      id: "copilot-cli-scoped",
      label: "copilot-instructions (scoped)",
      path: ".github/copilot-instructions/app.instructions.md",
      content: `---\napplyTo: \"**/*.{ts,tsx}\"\n---\n\n# Example: scoped instructions (applyTo)\n\nThese instructions apply only to TypeScript files.\n\n- Prefer \`type\` imports for types (\`import type { ... }\`).\n- Avoid \`any\` unless you justify it.\n- Keep components server-first; add \"use client\" only when needed.\n- Add tests for new behavior when practical.\n`,
    },
  },
  "github-copilot": {
    root: {
      id: "github-copilot-root",
      label: "copilot-instructions.md (root)",
      path: ".github/copilot-instructions.md",
      content: `# Example: \`.github/copilot-instructions.md\`

Use this file to tell GitHub Copilot how to work in your repo.

## Working agreement
- Prefer small, reviewable diffs.
- Fix root causes; avoid band-aids.
- Run tests and linters before proposing changes.

## Project conventions
- Package manager: \`pnpm\`
- Tests: \`pnpm test\`
- Type-check: \`pnpm type-check\`
- Lint: \`pnpm lint\`

## Output style
- Be concise, direct, and actionable.
- When unsure, ask clarifying questions rather than guessing.
`,
    },
    scoped: {
      id: "github-copilot-scoped",
      label: "instructions (scoped)",
      path: ".github/instructions/app.instructions.md",
      content: `---\napplyTo: \"**/*.{ts,tsx}\"\n---\n\n# Example: scoped instructions (applyTo)\n\nThese instructions apply only to TypeScript files.\n\n- Prefer \`type\` imports for types (\`import type { ... }\`).\n- Avoid \`any\` unless you justify it.\n- Keep components server-first; add \"use client\" only when needed.\n- Add tests for new behavior when practical.\n`,
    },
  },
};

type InstructionHealthPanelProps = {
  diagnostics: InstructionDiagnostics;
  copySummaryText?: string;
};

function buildSummaryCounts(diagnostics: InstructionDiagnostic[]) {
  return diagnostics.reduce(
    (acc, item) => {
      acc[item.severity] += 1;
      return acc;
    },
    { error: 0, warning: 0, info: 0 },
  );
}

function resolveTemplate(tool: SimulatorToolId, diagnostic: InstructionDiagnostic): InstructionTemplate | null {
  const templates = TEMPLATE_LIBRARY[tool];
  if (!templates) return null;

  if (diagnostic.code.startsWith("missing.agents") || diagnostic.code === "override-without-base") {
    return templates.root;
  }
  if (diagnostic.code.startsWith("missing.claude") || diagnostic.code.startsWith("missing.gemini")) {
    return templates.root;
  }
  if (diagnostic.code === "missing.copilot-cli" || diagnostic.code === "missing.github-copilot") {
    return templates.root;
  }
  if (
    diagnostic.code === "wrong-extension.copilot-cli" ||
    diagnostic.code === "wrong-folder.copilot-cli" ||
    diagnostic.code === "wrong-folder.github-copilot"
  ) {
    return templates.scoped;
  }
  return null;
}

function shouldSuggestWorkbench(diagnostic: InstructionDiagnostic): boolean {
  return diagnostic.code.startsWith("missing.");
}

export function InstructionHealthPanel({ diagnostics, copySummaryText }: InstructionHealthPanelProps) {
  const sortedDiagnostics = [...diagnostics.diagnostics].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );
  const counts = buildSummaryCounts(sortedDiagnostics);
  const statusLabel = counts.error > 0 ? "Fail" : counts.warning > 0 ? "Warn" : "Pass";
  const statusTone = counts.error > 0 ? "danger" : counts.warning > 0 ? "warning" : "success";
  const summaryParts = [
    `${counts.error} error${counts.error === 1 ? "" : "s"}`,
    `${counts.warning} warning${counts.warning === 1 ? "" : "s"}`,
  ];
  if (counts.info > 0) {
    summaryParts.push(`${counts.info} note${counts.info === 1 ? "" : "s"}`);
  }

  return (
    <div className="rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-mdt-3">
      <Stack gap={3}>
        <div className="flex flex-wrap items-start justify-between gap-mdt-3">
          <div className="space-y-mdt-1">
            <Text as="h3" size="caption" weight="semibold" tone="muted" className="uppercase tracking-wide">
              Instruction health
            </Text>
            <Text size="bodySm" tone="muted">
              Validates file placement for the selected tool. Local-only.
            </Text>
          </div>
          {copySummaryText ? (
            <CopyButton text={copySummaryText} label="Copy fix summary" copiedLabel="Fix summary copied" size="xs" variant="secondary" />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-mdt-2">
          <Badge tone={statusTone}>{statusLabel}</Badge>
          <Text size="bodySm" tone="muted">
            {summaryParts.join(" / ")}
          </Text>
        </div>

        {sortedDiagnostics.length === 0 ? (
          <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2">
            <Text size="bodySm" weight="semibold">
              Everything looks good
            </Text>
            <Text size="bodySm" tone="muted">
              No placement issues detected for this tool.
            </Text>
          </div>
        ) : (
          <ul className="space-y-mdt-2" aria-label="Instruction health issues">
            {sortedDiagnostics.map((item, index) => {
              const template = resolveTemplate(diagnostics.tool, item);
              const suggestion = item.suggestion ?? (item.expectedPath ? `Expected path: ${item.expectedPath}` : null);
              const examplePath = item.expectedPath ?? template?.path ?? null;
              const showWorkbench = shouldSuggestWorkbench(item);
              return (
                <li
                  key={`${item.code}-${index}`}
                  className="rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2"
                >
                  <div className="flex flex-wrap items-center gap-mdt-2">
                    <Badge tone={severityTone[item.severity]}>{severityLabel[item.severity]}</Badge>
                    <Text size="bodySm" weight="semibold">
                      {item.message}
                    </Text>
                  </div>
                  {suggestion ? (
                    <Text size="bodySm" tone="muted" className="mt-mdt-1">
                      {suggestion}
                    </Text>
                  ) : null}
                  {template || examplePath || showWorkbench ? (
                    <div className="mt-mdt-2 flex flex-wrap items-center gap-mdt-2">
                      {template ? (
                        <CopyButton
                          text={template.content}
                          label="Copy template"
                          copiedLabel="Template copied"
                          variant="secondary"
                          size="xs"
                          aria-label={`Copy ${template.label}`}
                        />
                      ) : null}
                      {showWorkbench ? (
                        <Button asChild variant="secondary" size="xs">
                          <Link href="/workbench">Open Workbench</Link>
                        </Button>
                      ) : null}
                      {examplePath ? <PathChip path={examplePath} /> : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Stack>
    </div>
  );
}
