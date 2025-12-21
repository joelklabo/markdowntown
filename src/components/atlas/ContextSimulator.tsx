"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Heading } from "@/components/ui/Heading";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Stack } from "@/components/ui/Stack";
import { Text } from "@/components/ui/Text";
import { TextArea } from "@/components/ui/TextArea";
import { InstructionHealthPanel } from "@/components/atlas/InstructionHealthPanel";
import { SimulatorInsights } from "@/components/atlas/SimulatorInsights";
import { SimulatorScanMeta } from "@/components/atlas/SimulatorScanMeta";
import { DEFAULT_MAX_CONTENT_BYTES } from "@/lib/atlas/simulators/contentScan";
import { computeInstructionDiagnostics } from "@/lib/atlas/simulators/diagnostics";
import { computeSimulatorInsights } from "@/lib/atlas/simulators/insights";
import { simulateContextResolution } from "@/lib/atlas/simulators/simulate";
import type { FileSystemDirectoryHandleLike } from "@/lib/atlas/simulators/fsScan";
import { scanRepoTree } from "@/lib/atlas/simulators/fsScan";
import { scanFileList } from "@/lib/atlas/simulators/fileListScan";
import type {
  InstructionDiagnostics,
  RepoTree,
  SimulationResult,
  SimulatorInsights as SimulatorInsightsData,
  SimulatorToolId,
} from "@/lib/atlas/simulators/types";
import { track, trackError } from "@/lib/analytics";
import { featureFlags } from "@/lib/flags";

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

function normalizePaths(paths: string[]): string[] {
  return paths.map((path) => normalizePath(path)).filter(Boolean);
}

function buildInputSignature(
  tool: SimulatorToolId,
  cwd: string,
  repoSource: "manual" | "folder",
  paths: string[],
): string {
  return JSON.stringify({
    tool,
    cwd: normalizePath(cwd),
    repoSource,
    paths: normalizePaths(paths),
  });
}

function isInstructionPath(path: string): boolean {
  if (!path) return false;
  if (path === ".github/copilot-instructions.md") return true;
  if (path.startsWith(".github/instructions/") && path.endsWith(".instructions.md")) return true;
  if (path.startsWith(".github/copilot-instructions/") && path.endsWith(".instructions.md")) return true;
  if (path.startsWith(".github/agents/")) return true;
  if (path === "AGENTS.md" || path.endsWith("/AGENTS.md")) return true;
  if (path === "AGENTS.override.md" || path.endsWith("/AGENTS.override.md")) return true;
  if (path === "CLAUDE.md" || path.endsWith("/CLAUDE.md")) return true;
  if (path === "GEMINI.md" || path.endsWith("/GEMINI.md")) return true;
  return false;
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

const EMPTY_REPO_TREE: RepoTree = { files: [] };

function toolLabel(tool: SimulatorToolId): string {
  return TOOL_OPTIONS.find((option) => option.id === tool)?.label ?? tool;
}

type SummaryInput = {
  tool: SimulatorToolId;
  cwd: string;
  repoSource: "manual" | "folder";
  result: SimulationResult;
  insights: SimulatorInsightsData;
  extraFiles: string[];
  isStale: boolean;
};

function formatSummary({ tool, cwd, repoSource, result, insights, extraFiles, isStale }: SummaryInput): string {
  const lines: string[] = [];
  lines.push(`Tool: ${toolLabel(tool)} (${tool})`);
  lines.push(`CWD: ${normalizePath(cwd) || "(repo root)"}`);
  lines.push(`Repo source: ${repoSource === "folder" ? "folder scan" : "manual paths"}`);

  if (isStale) {
    lines.push("Note: Results may be out of date. Re-run simulation for fresh results.");
  }

  lines.push("");
  lines.push("Loaded files:");
  if (result.loaded.length === 0) {
    lines.push("- (none)");
  } else {
    for (const file of result.loaded) {
      lines.push(`- ${file.path} — ${file.reason}`);
    }
  }

  lines.push("");
  lines.push("Missing instruction patterns:");
  if (insights.missingFiles.length === 0) {
    lines.push("- (none)");
  } else {
    for (const item of insights.missingFiles) {
      lines.push(`- ${item.label}: ${item.pattern}`);
    }
  }

  lines.push("");
  lines.push("Extra instruction files:");
  if (extraFiles.length === 0) {
    lines.push("- (none)");
  } else {
    for (const path of extraFiles) {
      lines.push(`- ${path}`);
    }
  }

  lines.push("");
  lines.push("Warnings:");
  if (result.warnings.length === 0) {
    lines.push("- (none)");
  } else {
    for (const warning of result.warnings) {
      lines.push(`- ${warning.code}: ${warning.message}`);
    }
  }

  lines.push("");
  lines.push("Precedence notes:");
  if (insights.precedenceNotes.length === 0) {
    lines.push("- (none)");
  } else {
    for (const note of insights.precedenceNotes) {
      lines.push(`- ${note}`);
    }
  }

  return lines.join("\n");
}

type FixSummaryInput = {
  tool: SimulatorToolId;
  cwd: string;
  diagnostics: InstructionDiagnostics;
  isStale: boolean;
};

function formatFixSummary({ tool, cwd, diagnostics, isStale }: FixSummaryInput): string {
  const lines: string[] = [];
  const errorCount = diagnostics.diagnostics.filter((item) => item.severity === "error").length;
  const warningCount = diagnostics.diagnostics.filter((item) => item.severity === "warning").length;
  const infoCount = diagnostics.diagnostics.filter((item) => item.severity === "info").length;
  const statusLabel = errorCount > 0 ? "Fail" : warningCount > 0 ? "Warn" : "Pass";

  lines.push(`Instruction health: ${toolLabel(tool)} (${tool})`);
  lines.push(`CWD: ${normalizePath(cwd) || "(repo root)"}`);
  if (isStale) {
    lines.push("Note: Results may be out of date. Re-run simulation for fresh results.");
  }
  lines.push(`Status: ${statusLabel}`);
  lines.push(`Counts: ${errorCount} error(s), ${warningCount} warning(s), ${infoCount} note(s)`);
  lines.push("");

  if (diagnostics.diagnostics.length === 0) {
    lines.push("No placement issues detected.");
    return lines.join("\n");
  }

  lines.push("Issues:");
  for (const issue of diagnostics.diagnostics) {
    lines.push(`- [${issue.severity.toUpperCase()}] ${issue.message}`);
    if (issue.suggestion) {
      lines.push(`  Fix: ${issue.suggestion}`);
    } else if (issue.expectedPath) {
      lines.push(`  Expected: ${issue.expectedPath}`);
    }
  }

  return lines.join("\n");
}

export function ContextSimulator() {
  const [tool, setTool] = useState<SimulatorToolId>("github-copilot");
  const [cwd, setCwd] = useState("");
  const [repoSource, setRepoSource] = useState<"manual" | "folder">("folder");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [contentLintOptIn, setContentLintOptIn] = useState(false);
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
  const [result, setResult] = useState<SimulationResult>(() =>
    simulateContextResolution({ tool: "github-copilot", cwd: "", tree: EMPTY_REPO_TREE }),
  );
  const [insights, setInsights] = useState<SimulatorInsightsData>(() =>
    computeSimulatorInsights({ tool: "github-copilot", cwd: "", tree: EMPTY_REPO_TREE }),
  );
  const [instructionDiagnostics, setInstructionDiagnostics] = useState<InstructionDiagnostics>(() =>
    computeInstructionDiagnostics({ tool: "github-copilot", cwd: "", tree: EMPTY_REPO_TREE }),
  );
  const [lastSimulatedSignature, setLastSimulatedSignature] = useState(() =>
    buildInputSignature("github-copilot", "", "folder", []),
  );
  const [lastSimulatedPaths, setLastSimulatedPaths] = useState<string[]>(() => []);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const statusTimeoutRef = useRef<number | null>(null);

  const canPickDirectory = typeof window !== "undefined" && "showDirectoryPicker" in window;

  const manualPaths = useMemo(() => parseRepoPaths(repoText), [repoText]);
  const repoFileCount = repoSource === "folder" ? scannedTree?.files.length ?? 0 : manualPaths.length;
  const repoPaths = useMemo(
    () => (repoSource === "folder" ? (scannedTree?.files ?? []).map((file) => file.path) : manualPaths),
    [manualPaths, repoSource, scannedTree],
  );
  const repoSignals = useMemo(() => analyzeRepo(repoPaths), [repoPaths]);
  const currentSignature = useMemo(
    () => buildInputSignature(tool, cwd, repoSource, repoPaths),
    [cwd, repoPaths, repoSource, tool],
  );
  const isStale = currentSignature !== lastSimulatedSignature;
  const advancedOpen = showAdvanced || repoSource === "manual";
  const maxContentKb = Math.round(DEFAULT_MAX_CONTENT_BYTES / 1024);

  const scannedPreview = useMemo(() => {
    const paths = (scannedTree?.files ?? []).map((file) => file.path);
    const limit = 200;
    const head = paths.slice(0, limit);
    const suffix = paths.length > limit ? `\n… (${paths.length - limit} more)` : "";
    return head.join("\n") + suffix;
  }, [scannedTree]);

  const emptyStateHint = useMemo(() => {
    if (repoSource === "folder" && !scannedTree) {
      return "Choose a folder to scan to see which instruction files load.";
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

  const extraInstructionFiles = useMemo(() => {
    const found = new Set(insights.foundFiles.map((path) => normalizePath(path)));
    return lastSimulatedPaths.filter((path) => isInstructionPath(path) && !found.has(path));
  }, [insights, lastSimulatedPaths]);
  const fixSummaryText = useMemo(
    () => formatFixSummary({ tool, cwd, diagnostics: instructionDiagnostics, isStale }),
    [cwd, instructionDiagnostics, isStale, tool],
  );

  const announceStatus = (message: string) => {
    setActionStatus(message);
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = window.setTimeout(() => setActionStatus(null), 3000);
  };

  const runSimulationWithTree = (
    tree: RepoTree,
    sourcePaths: string[],
    source: "manual" | "folder",
    trigger: "manual" | "scan",
  ) => {
    const normalizedPaths = normalizePaths(sourcePaths);
    const nextResult = simulateContextResolution({ tool, cwd, tree });
    const nextInsights = computeSimulatorInsights({ tool, cwd, tree });
    const nextDiagnostics = computeInstructionDiagnostics({ tool, cwd, tree });
    setResult(nextResult);
    setInsights(nextInsights);
    setInstructionDiagnostics(nextDiagnostics);
    setLastSimulatedSignature(buildInputSignature(tool, cwd, source, normalizedPaths));
    setLastSimulatedPaths(normalizedPaths);
    setRepoSource(source);
    setShowAdvanced(source === "manual");
    track("atlas_simulator_simulate", {
      tool,
      repoSource: source,
      trigger,
      cwd: normalizePath(cwd) || undefined,
      fileCount: normalizedPaths.length,
    });
  };

  const handleCopySummary = async () => {
    const summary = formatSummary({
      tool,
      cwd,
      repoSource,
      result,
      insights,
      extraFiles: extraInstructionFiles,
      isStale,
    });
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(summary);
      announceStatus("Summary copied to clipboard.");
      track("atlas_simulator_copy_summary", {
        tool,
        repoSource,
        fileCount: lastSimulatedPaths.length,
      });
    } catch (err) {
      announceStatus("Unable to copy summary.");
      if (err instanceof Error) {
        trackError("atlas_simulator_copy_error", err, { tool, repoSource });
      }
    }
  };

  const handleDownloadReport = () => {
    const summary = formatSummary({
      tool,
      cwd,
      repoSource,
      result,
      insights,
      extraFiles: extraInstructionFiles,
      isStale,
    });
    try {
      const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `atlas-simulator-${tool}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      announceStatus("Report downloaded.");
      track("atlas_simulator_download_report", {
        tool,
        repoSource,
        fileCount: lastSimulatedPaths.length,
      });
    } catch (err) {
      announceStatus("Unable to download report.");
      if (err instanceof Error) {
        trackError("atlas_simulator_download_error", err, { tool, repoSource });
      }
    }
  };

  return (
    <div className="grid gap-mdt-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:gap-mdt-8">
      <Card className="p-mdt-5">
        <Stack gap={5}>
          <Stack gap={1}>
            <Heading level="h2">Scan setup</Heading>
            <Text tone="muted">Choose a tool, set the working directory, and scan a folder.</Text>
          </Stack>

          <div className="space-y-mdt-4">
            <div className="space-y-mdt-2 rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-mdt-3">
              <label htmlFor="sim-tool" className="text-caption font-semibold uppercase tracking-wide text-mdt-muted">
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

            <div className="space-y-mdt-2 rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-mdt-3">
              <label htmlFor="sim-cwd" className="text-caption font-semibold uppercase tracking-wide text-mdt-muted">
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

            <div className="space-y-mdt-3 rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-mdt-3">
              <label className="text-caption font-semibold uppercase tracking-wide text-mdt-muted">Scan a folder</label>
              <Text tone="muted" size="bodySm">
                {canPickDirectory
                  ? "Scans locally in your browser. File contents are never uploaded."
                  : "File System Access API isn’t supported. Use the folder upload below; scans stay local."}
              </Text>
              <div className="space-y-mdt-3">
                {canPickDirectory ? (
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    disabled={isScanning}
                    onClick={async () => {
                      setScanError(null);
                      setIsScanning(true);
                      track("atlas_simulator_scan_start", { method: "directory_picker", tool });
                      try {
                        const picker = (window as unknown as { showDirectoryPicker?: () => Promise<unknown> }).showDirectoryPicker;
                        if (!picker) throw new Error("File System Access API not available");
                        const handle = await picker();
                        const { tree, totalFiles, matchedFiles, truncated } = await scanRepoTree(
                          handle as FileSystemDirectoryHandleLike,
                          { includeContent: contentLintOptIn },
                        );
                        const rootName = (handle as { name?: string }).name;
                        setScannedTree(tree);
                        setScanMeta({
                          totalFiles,
                          matchedFiles,
                          truncated,
                          rootName,
                        });
                        runSimulationWithTree(
                          tree,
                          tree.files.map((file) => file.path),
                          "folder",
                          "scan",
                        );
                        track("atlas_simulator_scan_complete", {
                          method: "directory_picker",
                          tool,
                          totalFiles,
                          matchedFiles,
                          truncated,
                          rootName,
                        });
                      } catch (err) {
                        if (err instanceof DOMException && err.name === "AbortError") {
                          track("atlas_simulator_scan_cancel", { method: "directory_picker", tool });
                          return;
                        }
                        if (err instanceof Error) {
                          trackError("atlas_simulator_scan_error", err, {
                            method: "directory_picker",
                            tool,
                          });
                        }
                        setScanError(err instanceof Error ? err.message : "Unable to scan folder");
                      } finally {
                        setIsScanning(false);
                      }
                    }}
                  >
                    {isScanning ? "Scanning…" : "Scan a folder"}
                  </Button>
                ) : (
                  <Input
                    type="file"
                    multiple
                    // @ts-expect-error - non-standard attribute for directory uploads
                    webkitdirectory="true"
                    aria-label="Upload folder"
                    onChange={async (event) => {
                      setScanError(null);
                      const files = event.target.files;
                      if (!files || files.length === 0) return;
                      try {
                        track("atlas_simulator_scan_start", { method: "file_input", tool });
                        const { tree, totalFiles, matchedFiles, truncated } = await scanFileList(files, {
                          includeContent: contentLintOptIn,
                        });
                        const rootName = files[0]?.webkitRelativePath?.split("/")[0];
                        setScannedTree(tree);
                        setScanMeta({ totalFiles, matchedFiles, truncated, rootName });
                        runSimulationWithTree(
                          tree,
                          tree.files.map((file) => file.path),
                          "folder",
                          "scan",
                        );
                        track("atlas_simulator_scan_complete", {
                          method: "file_input",
                          tool,
                          totalFiles,
                          matchedFiles,
                          truncated,
                          rootName,
                        });
                      } catch (err) {
                        if (err instanceof Error) {
                          trackError("atlas_simulator_scan_error", err, {
                            method: "file_input",
                            tool,
                          });
                        }
                        setScanError(err instanceof Error ? err.message : "Unable to scan folder");
                      }
                    }}
                  />
                )}

                {scanError ? (
                  <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2 text-caption text-[color:var(--mdt-color-danger)]">
                    {scanError}
                  </div>
                ) : null}

                {scanMeta ? <SimulatorScanMeta {...scanMeta} /> : null}

                <TextArea
                  id="sim-tree-preview"
                  rows={8}
                  value={scannedPreview}
                  readOnly
                  placeholder="Scanned paths will appear here."
                />

                <div className="space-y-mdt-2 rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2">
                  <Text as="h4" size="caption" weight="semibold" tone="muted" className="uppercase tracking-wide">
                    Optional: content linting
                  </Text>
                  <Text tone="muted" size="bodySm">
                    Opt in to read instruction file contents locally for linting. Files never leave your browser.
                  </Text>
                  <Checkbox
                    checked={contentLintOptIn}
                    onChange={(event) => setContentLintOptIn(event.target.checked)}
                  >
                    Enable content linting (local-only)
                  </Checkbox>
                  <Text tone="muted" size="bodySm">
                    Only instruction files are read. Files larger than {maxContentKb} KB are skipped.
                  </Text>
                </div>
              </div>

              <details
                className="rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2"
                open={advancedOpen}
                onToggle={(event) => setShowAdvanced((event.currentTarget as HTMLDetailsElement).open)}
              >
                <summary className="cursor-pointer text-caption font-semibold uppercase tracking-wide text-mdt-muted">
                  Advanced: paste repo paths
                </summary>
                <div className="mt-mdt-3 space-y-mdt-3">
                  <Text tone="muted" size="bodySm">
                    Use this when you can’t scan a folder. One path per line.
                  </Text>
                  <TextArea
                    id="sim-tree-manual"
                    rows={8}
                    value={repoText}
                    onChange={(e) => {
                      if (repoSource !== "manual") setRepoSource("manual");
                      setShowAdvanced(true);
                      setRepoText(e.target.value);
                    }}
                    placeholder="One path per line (e.g. .github/copilot-instructions.md)"
                  />
                </div>
              </details>

              <Text tone="muted" size="bodySm">
                {repoFileCount} file(s) in the current source. Lines starting with `#` or `//` are ignored.
              </Text>
            </div>
          </div>

          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => {
              const tree =
                repoSource === "folder"
                  ? scannedTree ?? { files: [] }
                  : toRepoTree(manualPaths);
              const sourcePaths =
                repoSource === "folder"
                  ? (scannedTree?.files ?? []).map((file) => file.path)
                  : manualPaths;
              runSimulationWithTree(tree, sourcePaths, repoSource, "manual");
            }}
          >
            Refresh results
          </Button>
        </Stack>
      </Card>

      <Card className="p-mdt-5">
        <Stack gap={5}>
          <Stack gap={2}>
            <Heading level="h2">Results</Heading>
            <Text tone="muted">See what loads, what is missing, and any warnings.</Text>
            {isStale ? (
              <div
                className="rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-mdt-3 py-mdt-2 text-caption text-mdt-muted"
                role="status"
              >
                Results are out of date. Run Simulate to refresh.
              </div>
            ) : null}
          </Stack>

          <div className="space-y-mdt-4">
            {featureFlags.instructionHealthV1 ? (
              <InstructionHealthPanel diagnostics={instructionDiagnostics} copySummaryText={fixSummaryText} />
            ) : null}
            <div className="space-y-mdt-2 rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-mdt-3">
              <Text as="h3" size="caption" weight="semibold" tone="muted" className="uppercase tracking-wide">
                Summary
              </Text>
              <Text size="bodySm" tone="muted">
                {result.loaded.length} loaded, {insights.missingFiles.length} missing pattern
                {insights.missingFiles.length === 1 ? "" : "s"}, {extraInstructionFiles.length} extra instruction file
                {extraInstructionFiles.length === 1 ? "" : "s"}, {result.warnings.length} warning
                {result.warnings.length === 1 ? "" : "s"}.
              </Text>
            </div>

            <div className="space-y-mdt-3 rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-mdt-3">
              <Text as="h3" size="caption" weight="semibold" tone="muted" className="uppercase tracking-wide">
                Loaded files
              </Text>
              {result.loaded.length === 0 ? (
                <Stack gap={1}>
                  <Text tone="muted" size="bodySm">No files would be loaded for this input.</Text>
                  {emptyStateHint ? (
                    <Text tone="muted" size="bodySm">
                      {emptyStateHint}
                    </Text>
                  ) : null}
                </Stack>
              ) : (
                <ul className="space-y-mdt-2" aria-label="Loaded files">
                  {result.loaded.map((file) => (
                    <li key={file.path} className="rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2">
                      <div className="font-mono text-body-sm text-mdt-text">{file.path}</div>
                      <div className="text-body-xs text-mdt-muted">{file.reason}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-mdt-3 rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-mdt-3">
              <Text as="h3" size="caption" weight="semibold" tone="muted" className="uppercase tracking-wide">
                Warnings
              </Text>
              {result.warnings.length === 0 ? (
                <Text tone="muted" size="bodySm">No warnings.</Text>
              ) : (
                <ul className="space-y-mdt-2" aria-label="Warnings">
                  {result.warnings.map((warning) => (
                    <li key={warning.code} className="rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2">
                      <div className="text-body-sm font-semibold text-mdt-text">{warning.code}</div>
                      <div className="text-body-xs text-mdt-muted">{warning.message}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <SimulatorInsights insights={insights} extraFiles={extraInstructionFiles} />

            <div className="space-y-mdt-3 rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-mdt-3">
              <Text as="h3" size="caption" weight="semibold" tone="muted" className="uppercase tracking-wide">
                Actions
              </Text>
              <div className="flex flex-wrap gap-mdt-2">
                <Button type="button" variant="secondary" onClick={handleCopySummary}>
                  Copy summary
                </Button>
                <Button type="button" variant="secondary" onClick={handleDownloadReport}>
                  Download report
                </Button>
              </div>
              {actionStatus ? (
                <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2 text-caption text-mdt-muted" role="status" aria-live="polite">
                  {actionStatus}
                </div>
              ) : null}
            </div>
          </div>
        </Stack>
      </Card>
    </div>
  );
}
