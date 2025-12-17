"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Button } from "@/components/ui/Button";
import { FileTree } from "@/components/ui/FileTree";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "@/components/ui/Tabs";
import { safeParseUamV1 } from "@/lib/uam/uamValidate";
import type { UamScopeV1 } from "@/lib/uam/uamTypes";

type CompileResult = {
  files: Array<{ path: string; content: string }>;
  warnings: string[];
  info?: string[];
};

type VersionRow = {
  id: string;
  version: string;
  message: string | null;
  createdAt: string;
};

export type ArtifactDetailTabsProps = {
  artifactId: string;
  version: string;
  uam: unknown;
  targets: string[];
  lintGrade: string | null;
};

function scopeLabel(scope: UamScopeV1): string {
  if (scope.name && scope.name.trim().length > 0) return scope.name;
  if (scope.kind === "global") return "Global";
  if (scope.kind === "dir") return scope.dir;
  return scope.patterns.join(", ");
}

function blockLabel(block: { kind: string; title?: string }) {
  const title = block.title?.trim();
  if (title && title.length > 0) return title;
  return block.kind.toUpperCase();
}

function renderScopeMarkdown(scope: UamScopeV1, blocks: Array<{ kind: string; title?: string; body: string }>): string {
  const header = scope.kind === "global" ? "## Global" : `## ${scopeLabel(scope)}`;

  if (blocks.length === 0) return `${header}\n\n_(no blocks)_`;

  const renderedBlocks = blocks.map((b) => {
    const title = blockLabel(b);
    const body = b.body.trimEnd();
    return `### ${title}\n\n${body.length > 0 ? body : "_(empty)_"}`;
  });

  return `${header}\n\n${renderedBlocks.join("\n\n---\n\n")}`;
}

function buildRenderedMarkdown(uam: unknown): { markdown: string; ok: boolean } {
  const parsed = safeParseUamV1(uam);
  if (!parsed.success) {
    const raw = typeof uam === "string" ? uam : JSON.stringify(uam, null, 2);
    return { ok: false, markdown: `# Raw\n\n\`\`\`json\n${raw}\n\`\`\`` };
  }

  const data = parsed.data;
  const header = `# ${data.meta.title}${data.meta.description ? `\n\n${data.meta.description}` : ""}`;
  const sections = data.scopes.map((scope) => {
    const scoped = data.blocks.filter((b) => b.scopeId === scope.id);
    return renderScopeMarkdown(scope, scoped);
  });
  return { ok: true, markdown: `${header}\n\n${sections.join("\n\n---\n\n")}`.trimEnd() };
}

function storageKey(artifactId: string, version: string) {
  return `artifact-compile:${artifactId}:${version}`;
}

function safeParseCompileResult(raw: string | null): CompileResult | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CompileResult;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.files)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function ArtifactDetailTabs({ artifactId, version, uam, targets, lintGrade }: ArtifactDetailTabsProps) {
  const [tab, setTab] = React.useState<"rendered" | "raw" | "files" | "lint" | "versions">("rendered");

  const [compileResult, setCompileResult] = React.useState<CompileResult | null>(null);
  const [compileLoading, setCompileLoading] = React.useState(false);
  const [compileError, setCompileError] = React.useState<string | null>(null);
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);
  const [copiedPath, setCopiedPath] = React.useState<string | null>(null);

  const [versions, setVersions] = React.useState<VersionRow[] | null>(null);
  const [versionsLoading, setVersionsLoading] = React.useState(false);
  const [versionsError, setVersionsError] = React.useState<string | null>(null);

  const { markdown, ok: renderOk } = React.useMemo(() => buildRenderedMarkdown(uam), [uam]);

  React.useEffect(() => {
    const cached = safeParseCompileResult(sessionStorage.getItem(storageKey(artifactId, version)));
    if (!cached) return;
    setCompileResult(cached);
    setSelectedPath(cached.files[0]?.path ?? null);
  }, [artifactId, version]);

  const compileNow = async () => {
    try {
      setCompileError(null);
      setCompileLoading(true);

      const payloadTargets = targets.length > 0 ? targets.map((targetId) => ({ targetId })) : undefined;
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uam, targets: payloadTargets }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error ?? `Compilation failed (${res.status})`;
        throw new Error(message);
      }

      const data = (await res.json()) as CompileResult;
      setCompileResult(data);
      setSelectedPath(data.files[0]?.path ?? null);
      sessionStorage.setItem(storageKey(artifactId, version), JSON.stringify(data));
    } catch (err: unknown) {
      setCompileError(err instanceof Error ? err.message : "Compile failed");
    } finally {
      setCompileLoading(false);
    }
  };

  const files = compileResult?.files ?? [];
  const selectedFile = selectedPath ? files.find((f) => f.path === selectedPath) ?? null : null;

  React.useEffect(() => {
    if (tab !== "versions") return;
    if (versionsLoading || versions) return;

    void (async () => {
      try {
        setVersionsError(null);
        setVersionsLoading(true);

        const res = await fetch(`/api/artifacts/${artifactId}/versions`);
        if (!res.ok) throw new Error(`Failed to load versions (${res.status})`);

        const data = (await res.json()) as { versions?: VersionRow[] };
        setVersions(data.versions ?? []);
      } catch (err: unknown) {
        setVersionsError(err instanceof Error ? err.message : "Failed to load versions");
      } finally {
        setVersionsLoading(false);
      }
    })();
  }, [artifactId, tab, versions, versionsLoading]);

  return (
    <TabsRoot value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
      <TabsList>
        <TabsTrigger value="rendered" active={tab === "rendered"}>
          Rendered
        </TabsTrigger>
        <TabsTrigger value="raw" active={tab === "raw"}>
          Raw
        </TabsTrigger>
        <TabsTrigger value="files" active={tab === "files"}>
          Files
        </TabsTrigger>
        <TabsTrigger value="lint" active={tab === "lint"}>
          Lint
        </TabsTrigger>
        <TabsTrigger value="versions" active={tab === "versions"}>
          Versions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="rendered">
        {!renderOk && <div className="text-xs text-mdt-muted mb-3">This artifact does not validate as UAM v1.</div>}
        <div className="markdown-preview">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {markdown}
          </ReactMarkdown>
        </div>
      </TabsContent>

      <TabsContent value="raw">
        <pre className="text-xs overflow-auto whitespace-pre-wrap font-mono text-mdt-text">
          {JSON.stringify(uam, null, 2)}
        </pre>
      </TabsContent>

      <TabsContent value="files">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-mdt-muted">
              {targets.length > 0 ? `Targets: ${targets.join(", ")}` : "Targets: from artifact definition"}
            </div>
            <Button size="sm" variant="secondary" onClick={compileNow} disabled={compileLoading}>
              {compileLoading ? "Compiling…" : compileResult ? "Recompile" : "Compile"}
            </Button>
          </div>

          {compileError && <div className="text-xs text-mdt-danger">{compileError}</div>}

          {compileResult && (
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-mdt-muted uppercase tracking-wide mb-2">Manifest</div>
                <FileTree
                  paths={files.map((f) => f.path)}
                  selectedPath={selectedPath}
                  onSelect={(path) => setSelectedPath(path)}
                  emptyLabel="No files generated."
                />
              </div>

              <div className="min-w-0">
                {selectedFile ? (
                  <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle">
                    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-mdt-border">
                      <div className="font-mono text-xs text-mdt-text">{selectedFile.path}</div>
                      <div className="flex items-center gap-2">
                        {copiedPath === selectedFile.path && <div className="text-[11px] text-mdt-muted">Copied</div>}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(selectedFile.content);
                              setCopiedPath(selectedFile.path);
                              setTimeout(() => setCopiedPath(null), 1000);
                            } catch {
                              // ignore
                            }
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    <pre className="text-xs overflow-auto p-3 font-mono whitespace-pre-wrap">{selectedFile.content}</pre>
                  </div>
                ) : (
                  <div className="text-body-sm text-mdt-muted">Select a file to view its contents.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="lint">
        <div className="space-y-3">
          <div className="text-body-sm text-mdt-text">
            Lint grade: <span className="font-semibold">{lintGrade ?? "—"}</span>
          </div>

          {compileResult?.warnings && compileResult.warnings.length > 0 ? (
            <div className="p-3 bg-mdt-accent-soft border border-mdt-border rounded-mdt-md">
              <div className="text-xs font-semibold text-mdt-text mb-2">Compile warnings</div>
              <ul className="list-disc pl-5 text-xs text-mdt-text space-y-1">
                {compileResult.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-body-sm text-mdt-muted">No lint report available.</div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="versions">
        <div className="space-y-3">
          {versionsLoading && <div className="text-body-sm text-mdt-muted">Loading…</div>}
          {versionsError && <div className="text-body-sm text-mdt-danger">{versionsError}</div>}

          {versions && versions.length === 0 && <div className="text-body-sm text-mdt-muted">No versions yet.</div>}

          {versions && versions.length > 0 && (
            <ul className="space-y-2">
              {versions.map((v) => (
                <li key={v.id} className="rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-caption text-mdt-text">v{v.version}</div>
                    <div className="text-caption text-mdt-muted">{new Date(v.createdAt).toLocaleString()}</div>
                  </div>
                  {v.message && <div className="text-body-sm text-mdt-text mt-1">{v.message}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </TabsContent>
    </TabsRoot>
  );
}
