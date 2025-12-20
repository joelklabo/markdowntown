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
    <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-mdt-3 py-mdt-2 text-caption text-mdt-muted">
      {rootName ? (
        <span className="font-mono text-mdt-text">{rootName}</span>
      ) : null}
      {rootName ? <span className="text-mdt-muted">: </span> : null}
      {summary.join(", ")}
      {truncated ? " (truncated)" : ""}.
    </div>
  );
}
