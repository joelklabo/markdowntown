import { Text } from "@/components/ui/Text";

type SimulatorScanMetaProps = {
  totalFiles: number;
  matchedFiles: number;
  truncated: boolean;
  rootName?: string;
};

export function SimulatorScanMeta({ totalFiles, matchedFiles, truncated, rootName }: SimulatorScanMetaProps) {
  const summary: string[] = [`${totalFiles} file(s) scanned`];
  summary.push(`${matchedFiles} matched`);

  return (
    <Text tone="muted" size="bodySm">
      {rootName ? `${rootName}: ` : ""}
      {summary.join(", ")}
      {truncated ? " (truncated)" : ""}.
    </Text>
  );
}
