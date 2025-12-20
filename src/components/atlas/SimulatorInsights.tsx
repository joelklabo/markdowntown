import { Heading } from "@/components/ui/Heading";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import type { SimulatorInsights as SimulatorInsightsData } from "@/lib/atlas/simulators/types";

type SimulatorInsightsProps = {
  insights: SimulatorInsightsData;
  extraFiles: string[];
};

export function SimulatorInsights({ insights, extraFiles }: SimulatorInsightsProps) {
  return (
    <Stack gap={2}>
      <Heading level="h3">Insights</Heading>

      <Stack gap={2}>
        <div className="space-y-2">
          <Text tone="muted" size="bodySm">
            Expected patterns
          </Text>
          {insights.expectedPatterns.length === 0 ? (
            <Text tone="muted">No expected patterns available.</Text>
          ) : (
            <ul className="space-y-2" aria-label="Expected patterns">
              {insights.expectedPatterns.map((pattern) => (
                <li key={pattern.id} className="rounded-md border border-mdt-border bg-mdt-surface px-3 py-2">
                  <div className="text-body-sm font-semibold text-mdt-text">{pattern.label}</div>
                  <div className="font-mono text-body-xs text-mdt-muted">{pattern.pattern}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <Text tone="muted" size="bodySm">
            Missing instruction files
          </Text>
          {insights.missingFiles.length === 0 ? (
            <Text tone="muted">No missing instruction files detected.</Text>
          ) : (
            <ul className="space-y-2" aria-label="Missing instruction files">
              {insights.missingFiles.map((item) => (
                <li key={item.id} className="rounded-md border border-mdt-border bg-mdt-surface px-3 py-2">
                  <div className="text-body-sm font-semibold text-mdt-text">{item.label}</div>
                  <div className="font-mono text-body-xs text-mdt-muted">{item.pattern}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <Text tone="muted" size="bodySm">
            Extra instruction files
          </Text>
          {extraFiles.length === 0 ? (
            <Text tone="muted">No extra instruction files detected for this tool.</Text>
          ) : (
            <ul className="space-y-2" aria-label="Extra instruction files">
              {extraFiles.map((path) => (
                <li key={path} className="rounded-md border border-mdt-border bg-mdt-surface px-3 py-2">
                  <div className="font-mono text-body-sm text-mdt-text">{path}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <Text tone="muted" size="bodySm">
            Precedence notes
          </Text>
          {insights.precedenceNotes.length === 0 ? (
            <Text tone="muted">No precedence notes for this tool.</Text>
          ) : (
            <ul className="space-y-2" aria-label="Precedence notes">
              {insights.precedenceNotes.map((note, index) => (
                <li key={`${note}-${index}`} className="rounded-md border border-mdt-border bg-mdt-surface px-3 py-2">
                  <div className="text-body-sm text-mdt-text">{note}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Stack>
    </Stack>
  );
}
