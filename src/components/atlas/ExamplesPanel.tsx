import { CopyButton } from "@/components/atlas/CopyButton";
import { PathChip } from "@/components/atlas/PathChip";
import { Text } from "@/components/ui/Text";
import type { AtlasExample } from "@/lib/atlas/load";

type ExamplesPanelProps = {
  examples: AtlasExample[];
};

export function ExamplesPanel({ examples }: ExamplesPanelProps) {
  return (
    <section className="rounded-mdt-xl border border-mdt-border bg-mdt-surface p-mdt-4 shadow-mdt-sm">
      <div className="flex items-center justify-between gap-mdt-3">
        <div className="text-body-sm font-semibold text-mdt-text">Examples</div>
        <div className="text-caption text-mdt-muted">{examples.length}</div>
      </div>
      <div className="mt-mdt-2 text-body-xs text-mdt-muted">Snippets under atlas/examples/&lt;platformId&gt;/.</div>

      {examples.length === 0 ? (
        <Text className="mt-mdt-3" size="bodySm" tone="muted">
          No examples yet.
        </Text>
      ) : (
        <div className="mt-mdt-4 space-y-mdt-4">
          {examples.map((example) => (
            <div
              key={example.fileName}
              className="rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-mdt-3"
            >
              <div className="flex items-center justify-between gap-mdt-3">
                <PathChip path={example.fileName} />
                <CopyButton
                  text={example.contents}
                  label="Copy"
                  variant="secondary"
                  size="xs"
                  aria-label={`Copy example ${example.fileName}`}
                />
              </div>
              <pre className="mt-mdt-3 max-h-[360px] overflow-auto rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2 text-[11px] leading-relaxed text-mdt-text">
                <code>{example.contents}</code>
              </pre>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
