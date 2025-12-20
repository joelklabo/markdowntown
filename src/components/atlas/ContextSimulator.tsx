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
import { SimulatorScanMeta } from "@/components/atlas/SimulatorScanMeta";
import { simulateContextResolution } from "@/lib/atlas/simulators/simulate";
import type { FileSystemDirectoryHandleLike } from "@/lib/atlas/simulators/fsScan";
import { scanRepoTree } from "@/lib/atlas/simulators/fsScan";
import { scanFileList } from "@/lib/atlas/simulators/fileListScan";
import type { RepoTree, SimulationResult, SimulatorToolId } from "@/lib/atlas/simulators/types";

const TOOL_OPTIONS: Array<{ id: SimulatorToolId; label: string }> = [
  { id: "github-copilot", label: "GitHub Copilot" },
  { id: "copilot-cli", label: "Copilot CLI" },
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

type RepoSignals = {
  hasGitHubCopilotRoot: boolean;
  hasGitHubCopilotScoped: boolean;
  hasCopilotCliScoped: boolean;
  hasCopilotAgents: boolean;
  hasAgentsAny: boolean;
  hasAgentsOverrideAny: boolean;
  hasClaudeAny: boolean;
  hasGeminiAny: boolean;
};

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

function normalizePath(value: string): string {
  const normalized = value.replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/\/+$/, "");
  if (!normalized || normalized === ".") return "";
  return normalized;
}

function analyzeRepo(paths: string[]): RepoSignals {
  const signals: RepoSignals = {
    hasGitHubCopilotRoot: false,
    hasGitHubCopilotScoped: false,
    hasCopilotCliScoped: false,
    hasCopilotAgents: false,
    hasAgentsAny: false,
    hasAgentsOverrideAny: false,
    hasClaudeAny: false,
    hasGeminiAny: false,
  };

  for (const rawPath of paths) {
    const path = normalizePath(rawPath);
    if (!path) continue;
    if (path === ".github/copilot-instructions.md") {
      signals.hasGitHubCopilotRoot = true;
      continue;
    }
    if (path.startsWith(".github/instructions/") && path.endsWith(".instructions.md")) {
      signals.hasGitHubCopilotScoped = true;
      continue;
    }
    if (path.startsWith(".github/copilot-instructions/") && path.endsWith(".instructions.md")) {
      signals.hasCopilotCliScoped = true;
      continue;
    }
    if (path.startsWith(".github/agents/")) {
      signals.hasCopilotAgents = true;
      continue;
    }
    if (path === "AGENTS.md" || path.endsWith("/AGENTS.md")) {
      signals.hasAgentsAny = true;
      continue;
    }
    if (path === "AGENTS.override.md" || path.endsWith("/AGENTS.override.md")) {
      signals.hasAgentsOverrideAny = true;
      continue;
    }
    if (path === "CLAUDE.md" || path.endsWith("/CLAUDE.md")) {
      signals.hasClaudeAny = true;
      continue;
    }
    if (path === "GEMINI.md" || path.endsWith("/GEMINI.md")) {
      signals.hasGeminiAny = true;
      continue;
    }
  }

  return signals;
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
  const [scanMeta, setScanMeta] = useState<{
    totalFiles: number;
    matchedFiles: number;
    truncated: boolean;
    rootName?: string;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<SimulationResult>(() => runSimulation("github-copilot", "", DEFAULT_REPO_TREE));

  const canPickDirectory = typeof window !== "undefined" && "showDirectoryPicker" in window;

  const manualPaths = useMemo(() => parseRepoPaths(repoText), [repoText]);
  const repoFileCount = repoSource === "folder" ? scannedTree?.files.length ?? 0 : manualPaths.length;
  const repoPaths = useMemo(
    () => (repoSource === "folder" ? (scannedTree?.files ?? []).map((file) => file.path) : manualPaths),
    [manualPaths, repoSource, scannedTree],
  );
  const repoSignals = useMemo(() => analyzeRepo(repoPaths), [repoPaths]);

  const scannedPreview = useMemo(() => {
    const paths = (scannedTree?.files ?? []).map((file) => file.path);
    const limit = 200;
    const head = paths.slice(0, limit);
    const suffix = paths.length > limit ? `\n… (${paths.length - limit} more)` : "";
    return head.join("\n") + suffix;
  }, [scannedTree]);

  const emptyStateHint = useMemo(() => {
    if (repoSource === "folder" && !scannedTree) {
      return "Choose a folder to scan, then click Simulate.";
    }

    if (repoSource === "manual" && manualPaths.length === 0) {
      return "Add repo paths above to simulate instruction loading.";
    }

    if (tool === "github-copilot") {
      if (!repoSignals.hasGitHubCopilotRoot && !repoSignals.hasGitHubCopilotScoped) {
        return repoSource === "manual"
          ? "No Copilot instruction files in the list. Add .github/copilot-instructions.md or .github/instructions/*.instructions.md."
          : "No Copilot instruction files found. Add .github/copilot-instructions.md or .github/instructions/*.instructions.md.";
      }
    }

    if (tool === "copilot-cli") {
      if (!repoSignals.hasGitHubCopilotRoot && !repoSignals.hasCopilotCliScoped && !repoSignals.hasCopilotAgents) {
        return repoSource === "manual"
          ? "No Copilot CLI instruction files in the list. Add .github/copilot-instructions.md, .github/copilot-instructions/**/*.instructions.md, or .github/agents/*."
          : "No Copilot CLI instruction files found. Add .github/copilot-instructions.md, .github/copilot-instructions/**/*.instructions.md, or .github/agents/*.";
      }
    }

    if (tool === "codex-cli") {
      if (!repoSignals.hasAgentsAny && !repoSignals.hasAgentsOverrideAny) {
        return repoSource === "manual"
          ? "No AGENTS.md files in the list. Add AGENTS.md or AGENTS.override.md."
          : "No AGENTS.md files found. Add AGENTS.md or AGENTS.override.md.";
      }
      if (!cwd) {
        return "Set cwd to a directory inside the repo so ancestor scans can find AGENTS.md.";
      }
    }

    if (tool === "claude-code") {
      if (!repoSignals.hasClaudeAny) {
        return repoSource === "manual" ? "No CLAUDE.md files in the list." : "No CLAUDE.md files found.";
      }
      if (!cwd) {
        return "Set cwd to a directory inside the repo so ancestor scans can find CLAUDE.md.";
      }
    }

    if (tool === "gemini-cli") {
      if (!repoSignals.hasGeminiAny) {
        return repoSource === "manual" ? "No GEMINI.md files in the list." : "No GEMINI.md files found.";
      }
      if (!cwd) {
        return "Set cwd to a directory inside the repo so ancestor scans can find GEMINI.md.";
      }
    }

    return "If you expected files, double-check the repo tree and current directory.";
  }, [cwd, manualPaths.length, repoSignals, repoSource, scannedTree, tool]);

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
                onChange={() => setRepoSource("folder")}
                label="Local folder (File System Access API)"
              />
            </div>
            <Text tone="muted" size="bodySm">
              {canPickDirectory
                ? "Scans locally in your browser. File contents are never uploaded."
                : "File System Access API isn’t supported. Use the folder upload below; scans stay local."}
            </Text>
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
                {canPickDirectory ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isScanning}
                    onClick={async () => {
                      setScanError(null);
                      setIsScanning(true);
                      try {
                        const picker = (window as unknown as { showDirectoryPicker?: () => Promise<unknown> }).showDirectoryPicker;
                        if (!picker) throw new Error("File System Access API not available");
                        const handle = await picker();
                        const { tree, totalFiles, matchedFiles, truncated } = await scanRepoTree(
                          handle as FileSystemDirectoryHandleLike
                        );
                        setScannedTree(tree);
                        setScanMeta({
                          totalFiles,
                          matchedFiles,
                          truncated,
                          rootName: (handle as { name?: string }).name,
                        });
                        setResult(simulateContextResolution({ tool, cwd, tree }));
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
                ) : (
                  <Input
                    type="file"
                    multiple
                    // @ts-expect-error - non-standard attribute for directory uploads
                    webkitdirectory="true"
                    aria-label="Upload folder"
                    onChange={(event) => {
                      setScanError(null);
                      const files = event.target.files;
                      if (!files || files.length === 0) return;
                      try {
                        const { tree, totalFiles, matchedFiles, truncated } = scanFileList(files);
                        const rootName = files[0]?.webkitRelativePath?.split("/")[0];
                        setScannedTree(tree);
                        setScanMeta({ totalFiles, matchedFiles, truncated, rootName });
                        setResult(simulateContextResolution({ tool, cwd, tree }));
                      } catch (err) {
                        setScanError(err instanceof Error ? err.message : "Unable to scan folder");
                      }
                    }}
                  />
                )}

                {scanError ? (
                  <Text tone="muted" size="bodySm">
                    {scanError}
                  </Text>
                ) : null}

                {scanMeta ? <SimulatorScanMeta {...scanMeta} /> : null}

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
              <Stack gap={1}>
                <Text tone="muted">No files would be loaded for this input.</Text>
                {emptyStateHint ? (
                  <Text tone="muted" size="bodySm">
                    {emptyStateHint}
                  </Text>
                ) : null}
              </Stack>
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
