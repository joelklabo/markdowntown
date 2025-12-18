"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { TextArea } from "@/components/ui/TextArea";
import { simulateContextResolution } from "@/lib/atlas/simulators/simulate";
import type { FileSystemDirectoryHandleLike } from "@/lib/atlas/simulators/fsScan";
import { scanRepoTree } from "@/lib/atlas/simulators/fsScan";
import type { RepoTree, SimulationResult, SimulatorToolId } from "@/lib/atlas/simulators/types";

const TOOL_OPTIONS: Array<{ id: SimulatorToolId; label: string }> = [
  { id: "github-copilot", label: "GitHub Copilot" },
  { id: "claude-code", label: "Claude Code" },
  { id: "gemini-cli", label: "Gemini CLI" },
  { id: "codex-cli", label: "Codex CLI" },
];

const DEFAULT_REPO_TREE = [
  ".github/copilot-instructions.md",
  "CLAUDE.md",
  "GEMINI.md",
  "AGENTS.md",
  "AGENTS.override.md",
  ".cursor/rules/general.mdc",
].join("\n");

function parseRepoPaths(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#") && !line.startsWith("//"));
}

function toRepoTree(paths: string[]): RepoTree {
  return {
    files: paths.map((path) => ({ path, content: "" })),
  };
}

function runSimulation(tool: SimulatorToolId, cwd: string, repoText: string): SimulationResult {
  return simulateContextResolution({
    tool,
    cwd,
    tree: toRepoTree(parseRepoPaths(repoText)),
  });
}

export function ContextSimulator() {
  const [tool, setTool] = useState<SimulatorToolId>("github-copilot");
  const [cwd, setCwd] = useState("");
  const [repoSource, setRepoSource] = useState<"manual" | "folder">("manual");
  const [repoText, setRepoText] = useState(DEFAULT_REPO_TREE);
  const [scannedTree, setScannedTree] = useState<RepoTree | null>(null);
  const [scanMeta, setScanMeta] = useState<{ totalFiles: number; truncated: boolean; rootName?: string } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<SimulationResult>(() => runSimulation("github-copilot", "", DEFAULT_REPO_TREE));

  const canPickDirectory = typeof window !== "undefined" && "showDirectoryPicker" in window;

  const manualPaths = useMemo(() => parseRepoPaths(repoText), [repoText]);
  const repoFileCount = repoSource === "folder" ? scannedTree?.files.length ?? 0 : manualPaths.length;

  const scannedPreview = useMemo(() => {
    const paths = (scannedTree?.files ?? []).map((file) => file.path);
    const limit = 200;
    const head = paths.slice(0, limit);
    const suffix = paths.length > limit ? `\n… (${paths.length - limit} more)` : "";
    return head.join("\n") + suffix;
  }, [scannedTree]);

  return (
    <div className="grid gap-mdt-6 lg:grid-cols-[360px,1fr]">
      <Card className="p-mdt-4">
        <Stack gap={4}>
          <Stack gap={1}>
            <Heading level="h2">Inputs</Heading>
            <Text tone="muted">Select a tool, a repo tree, and a working directory.</Text>
          </Stack>

          <div className="space-y-2">
            <label htmlFor="sim-tool" className="text-body-sm font-semibold text-mdt-text">
              Tool
            </label>
            <Select id="sim-tool" value={tool} onChange={(e) => setTool(e.target.value as SimulatorToolId)}>
              {TOOL_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-body-sm font-semibold text-mdt-text">Repo source</div>
            <div className="flex flex-wrap gap-4">
              <Radio
                name="sim-repo-source"
                checked={repoSource === "manual"}
                onChange={() => setRepoSource("manual")}
                label="Manual (paste paths)"
              />
              <Radio
                name="sim-repo-source"
                checked={repoSource === "folder"}
                disabled={!canPickDirectory}
                onChange={() => setRepoSource("folder")}
                label="Local folder (File System Access API)"
              />
            </div>
            {!canPickDirectory ? (
              <Text tone="muted" size="bodySm">
                Folder picking isn’t supported in this browser.
              </Text>
            ) : (
              <Text tone="muted" size="bodySm">
                Scans locally in your browser. File contents are never uploaded.
              </Text>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="sim-cwd" className="text-body-sm font-semibold text-mdt-text">
              Current directory (cwd)
            </label>
            <Input
              id="sim-cwd"
              placeholder="e.g. src/app"
              value={cwd}
              onChange={(e) => setCwd(e.target.value)}
            />
            <Text tone="muted" size="bodySm">
              Used for tools that scan parent directories (e.g., `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`).
            </Text>
          </div>

          <div className="space-y-2">
            <label htmlFor="sim-tree" className="text-body-sm font-semibold text-mdt-text">
              Repo tree (paths)
            </label>
            {repoSource === "folder" ? (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!canPickDirectory || isScanning}
                  onClick={async () => {
                    setScanError(null);
                    setIsScanning(true);
                    try {
                      const picker = (window as unknown as { showDirectoryPicker?: () => Promise<unknown> }).showDirectoryPicker;
                      if (!picker) throw new Error("File System Access API not available");
                      const handle = await picker();
                      const { tree, totalFiles, truncated } = await scanRepoTree(handle as FileSystemDirectoryHandleLike);
                      setScannedTree(tree);
                      setScanMeta({ totalFiles, truncated, rootName: (handle as { name?: string }).name });
                    } catch (err) {
                      if (err instanceof DOMException && err.name === "AbortError") {
                        return;
                      }
                      setScanError(err instanceof Error ? err.message : "Unable to scan folder");
                    } finally {
                      setIsScanning(false);
                    }
                  }}
                >
                  {isScanning ? "Scanning…" : "Choose folder"}
                </Button>

                {scanError ? (
                  <Text tone="muted" size="bodySm">
                    {scanError}
                  </Text>
                ) : null}

                {scanMeta ? (
                  <Text tone="muted" size="bodySm">
                    {scanMeta.rootName ? `${scanMeta.rootName}: ` : ""}
                    {scanMeta.totalFiles} file(s) scanned{scanMeta.truncated ? " (truncated)" : ""}.
                  </Text>
                ) : null}

                <TextArea id="sim-tree" rows={10} value={scannedPreview} readOnly />
              </div>
            ) : (
              <TextArea
                id="sim-tree"
                rows={10}
                value={repoText}
                onChange={(e) => setRepoText(e.target.value)}
                placeholder="One path per line (e.g. .github/copilot-instructions.md)"
              />
            )}
            <Text tone="muted" size="bodySm">
              {repoFileCount} file(s). Lines starting with `#` or `//` are ignored.
            </Text>
          </div>

          <Button
            type="button"
            onClick={() => {
              const tree =
                repoSource === "folder"
                  ? scannedTree ?? { files: [] }
                  : toRepoTree(manualPaths);
              setResult(simulateContextResolution({ tool, cwd, tree }));
            }}
          >
            Simulate
          </Button>
        </Stack>
      </Card>

      <Card className="p-mdt-4">
        <Stack gap={4}>
          <Stack gap={1}>
            <Heading level="h2">Result</Heading>
            <Text tone="muted">Ordered files loaded and any warnings from heuristics.</Text>
          </Stack>

          <Stack gap={2}>
            <Heading level="h3">Loaded files</Heading>
            {result.loaded.length === 0 ? (
              <Text tone="muted">No files would be loaded for this input.</Text>
            ) : (
              <ul className="space-y-2" aria-label="Loaded files">
                {result.loaded.map((file) => (
                  <li key={file.path} className="rounded-md border border-mdt-border bg-mdt-surface px-3 py-2">
                    <div className="font-mono text-body-sm text-mdt-text">{file.path}</div>
                    <div className="text-body-xs text-mdt-muted">{file.reason}</div>
                  </li>
                ))}
              </ul>
            )}
          </Stack>

          <Stack gap={2}>
            <Heading level="h3">Warnings</Heading>
            {result.warnings.length === 0 ? (
              <Text tone="muted">No warnings.</Text>
            ) : (
              <ul className="space-y-2" aria-label="Warnings">
                {result.warnings.map((warning) => (
                  <li key={warning.code} className="rounded-md border border-mdt-border bg-mdt-surface px-3 py-2">
                    <div className="text-body-sm font-semibold text-mdt-text">{warning.code}</div>
                    <div className="text-body-xs text-mdt-muted">{warning.message}</div>
                  </li>
                ))}
              </ul>
            )}
          </Stack>
        </Stack>
      </Card>
    </div>
  );
}
