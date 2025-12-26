import { Badge } from "@/components/ui/Badge";

type SimulatorScanMetaProps = {
  totalFiles: number;
  matchedFiles: number;
  truncated: boolean;
  rootName?: string;
};

export function SimulatorScanMeta({ totalFiles, matchedFiles, truncated, rootName }: SimulatorScanMetaProps) {
  const matchedLabel = `${matchedFiles} instruction file${matchedFiles === 1 ? "" : "s"} found`;
  const totalLabel = `${totalFiles} total file${totalFiles === 1 ? "" : "s"} scanned`;
  const summary = [matchedLabel, totalLabel];

  return (
    <div className="flex flex-wrap items-center gap-mdt-2 rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-mdt-3 py-mdt-2 text-caption text-mdt-muted">
      {rootName ? <span className="font-mono text-mdt-text">{rootName}</span> : null}
      {rootName ? <span className="text-mdt-muted">: </span> : null}
      <span>{summary.join(" · ")}.</span>
      {truncated ? <Badge tone="warning">Scan truncated</Badge> : null}
    </div>
  );
}
