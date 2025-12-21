"use client";

import { CopyButton } from "@/components/atlas/CopyButton";
import { Badge } from "@/components/ui/Badge";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import type { InstructionDiagnostic, InstructionDiagnostics } from "@/lib/atlas/simulators/types";

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
              const suggestion = item.suggestion ?? (item.expectedPath ? `Expected path: ${item.expectedPath}` : null);
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
                </li>
              );
            })}
          </ul>
        )}
      </Stack>
    </div>
  );
}
