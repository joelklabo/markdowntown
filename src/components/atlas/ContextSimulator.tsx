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
import { InstructionContentLint } from "@/components/atlas/InstructionContentLint";
import { InstructionHealthPanel } from "@/components/atlas/InstructionHealthPanel";
import { NextStepsPanel } from "@/components/atlas/NextStepsPanel";
import { SimulatorInsights } from "@/components/atlas/SimulatorInsights";
import { SimulatorScanMeta } from "@/components/atlas/SimulatorScanMeta";
import { lintInstructionContent } from "@/lib/atlas/simulators/contentLint";
import { DEFAULT_MAX_CONTENT_BYTES } from "@/lib/atlas/simulators/contentScan";
import { detectTool } from "@/lib/atlas/simulators/detectTool";
import { computeInstructionDiagnostics } from "@/lib/atlas/simulators/diagnostics";
import { computeSimulatorInsights } from "@/lib/atlas/simulators/insights";
import { computeNextSteps } from "@/lib/atlas/simulators/nextSteps";
import { simulateContextResolution } from "@/lib/atlas/simulators/simulate";
import type { FileSystemDirectoryHandleLike } from "@/lib/atlas/simulators/fsScan";
import { scanRepoTree } from "@/lib/atlas/simulators/fsScan";
import { scanFileList } from "@/lib/atlas/simulators/fileListScan";
import { INSTRUCTION_TEMPLATES } from "@/lib/atlas/simulators/templates";
import type {
  InstructionDiagnostics,
  NextStepAction,
  RepoTree,
  SimulationResult,
  SimulatorInsights as SimulatorInsightsData,
  SimulatorToolId,
  ToolDetectionResult,
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

function pickDeepestPath(paths: string[]): string | null {
  if (paths.length === 0) return null;
  const normalized = paths.map((path) => normalizePath(path)).filter(Boolean);
  if (normalized.length === 0) return null;
  return normalized.sort((a, b) => {
    const depthDiff = b.split("/").length - a.split("/").length;
    return depthDiff !== 0 ? depthDiff : a.localeCompare(b);
  })[0];
}

function suggestCwdFromDetection(detection: ToolDetectionResult): string {
  if (!detection.tool) return "";
  if (detection.tool === "github-copilot" || detection.tool === "copilot-cli") return "";
  const candidate = detection.candidates.find((item) => item.tool === detection.tool);
  const path = candidate ? pickDeepestPath(candidate.paths) : null;
  if (!path) return "";
  const parts = path.split("/");
  parts.pop();
  return parts.join("/");
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
  const [toolDetection, setToolDetection] = useState<ToolDetectionResult | null>(null);
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const quickUploadEnabled = featureFlags.scanQuickUploadV1;
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
  const detectionSummary = useMemo(() => {
    if (!toolDetection) return null;
    if (toolDetection.tool) {
      const candidate = toolDetection.candidates.find((item) => item.tool === toolDetection.tool);
      return {
        title: `Detected: ${toolLabel(toolDetection.tool)}`,
        body: candidate?.reason ? `${candidate.reason}.` : "Matched known instruction files.",
      };
    }
    if (toolDetection.isMixed) {
      return {
        title: "Multiple tool formats detected",
        body: "Choose which tool to validate.",
      };
    }
    return {
      title: "No instruction files detected yet",
      body: "Pick a tool or paste paths to continue.",
    };
  }, [toolDetection]);
  const scanCounts = useMemo(() => {
    const foundCount = insights.foundFiles.length;
    const missingCount = insights.missingFiles.length;
    const foundLabel = `${foundCount} file${foundCount === 1 ? "" : "s"} found`;
    const missingLabel = `${missingCount} missing`;
    return `${foundLabel} · ${missingLabel}`;
  }, [insights.foundFiles.length, insights.missingFiles.length]);
  const showQuickSummary = quickUploadEnabled && repoSource === "folder" && repoFileCount > 0;
  const fixSummaryText = useMemo(
    () => formatFixSummary({ tool, cwd, diagnostics: instructionDiagnostics, isStale }),
    [cwd, instructionDiagnostics, isStale, tool],
  );
  const contentLintResult = useMemo(() => {
    if (!contentLintOptIn || repoSource !== "folder") return null;
    return lintInstructionContent(scannedTree ?? { files: [] });
  }, [contentLintOptIn, repoSource, scannedTree]);
  const nextSteps = useMemo(
    () =>
      computeNextSteps({
        tool,
        repoSource,
        repoFileCount,
        isStale,
        diagnostics: instructionDiagnostics,
        warnings: result.warnings,
        insights,
        extraFiles: extraInstructionFiles,
      }),
    [
      extraInstructionFiles,
      instructionDiagnostics,
      insights,
      isStale,
      repoFileCount,
      repoSource,
      result.warnings,
      tool,
    ],
  );

  const announceStatus = (message: string) => {
    setActionStatus(message);
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = window.setTimeout(() => setActionStatus(null), 3000);
  };

  const copyToClipboard = async (text: string, successMessage: string, errorMessage: string) => {
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(text);
      announceStatus(successMessage);
      return null;
    } catch (err) {
      announceStatus(errorMessage);
      return err instanceof Error ? err : new Error("Copy failed");
    }
  };

  const scrollToElement = (id: string, focus = false) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    if (focus && "focus" in element) {
      (element as HTMLElement).focus();
    }
  };

  const openAdvancedField = (id: string) => {
    setShowAdvanced(true);
    window.setTimeout(() => scrollToElement(id, true), 50);
  };

  const runSimulationWithTree = (
    tree: RepoTree,
    sourcePaths: string[],
    source: "manual" | "folder",
    trigger: "manual" | "scan",
    overrides?: { tool?: SimulatorToolId; cwd?: string },
  ) => {
    const normalizedPaths = normalizePaths(sourcePaths);
    const nextTool = overrides?.tool ?? tool;
    const nextCwd = overrides?.cwd ?? cwd;
    const nextResult = simulateContextResolution({ tool: nextTool, cwd: nextCwd, tree });
    const nextInsights = computeSimulatorInsights({ tool: nextTool, cwd: nextCwd, tree });
    const nextDiagnostics = computeInstructionDiagnostics({ tool: nextTool, cwd: nextCwd, tree });
    const errorCount = nextDiagnostics.diagnostics.filter((item) => item.severity === "error").length;
    const warningCount = nextDiagnostics.diagnostics.filter((item) => item.severity === "warning").length;
    const infoCount = nextDiagnostics.diagnostics.filter((item) => item.severity === "info").length;
    setResult(nextResult);
    setInsights(nextInsights);
    setInstructionDiagnostics(nextDiagnostics);
    setTool(nextTool);
    setCwd(nextCwd);
    setLastSimulatedSignature(buildInputSignature(nextTool, nextCwd, source, normalizedPaths));
    setLastSimulatedPaths(normalizedPaths);
    setRepoSource(source);
    setShowAdvanced(source === "manual");
    track("atlas_simulator_simulate", {
      tool: nextTool,
      repoSource: source,
      trigger,
      cwd: normalizePath(nextCwd) || undefined,
      fileCount: normalizedPaths.length,
    });
    if (featureFlags.instructionHealthV1) {
      track("atlas_simulator_health_check", {
        tool: nextTool,
        repoSource: source,
        trigger,
        cwd: normalizePath(nextCwd) || undefined,
        fileCount: normalizedPaths.length,
        issueCount: nextDiagnostics.diagnostics.length,
        errorCount,
        warningCount,
        infoCount,
      });
    }
  };

  const refreshResults = (shouldAnnounce = false) => {
    const tree = repoSource === "folder" ? scannedTree ?? { files: [] } : toRepoTree(manualPaths);
    const sourcePaths =
      repoSource === "folder"
        ? (scannedTree?.files ?? []).map((file) => file.path)
        : manualPaths;
    runSimulationWithTree(tree, sourcePaths, repoSource, "manual");
    if (shouldAnnounce) {
      announceStatus("Results refreshed.");
    }
  };

  const applyToolDetection = (paths: string[]) => {
    if (!quickUploadEnabled) return {};
    const detection = detectTool(paths);
    setToolDetection(detection);
    if (detection.tool && !detection.isMixed) {
      return {
        tool: detection.tool,
        cwd: suggestCwdFromDetection(detection),
      };
    }
    return {};
  };

  const handleDirectoryPickerScan = async () => {
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
      const paths = tree.files.map((file) => file.path);
      const overrides = applyToolDetection(paths);
      const nextTool = overrides.tool ?? tool;
      runSimulationWithTree(tree, paths, "folder", "scan", overrides);
      track("atlas_simulator_scan_complete", {
        method: "directory_picker",
        tool: nextTool,
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
  };

  const handleFileInputScan = async (files: FileList | null) => {
    setScanError(null);
    if (!files || files.length === 0) return;
    setIsScanning(true);
    try {
      track("atlas_simulator_scan_start", { method: "file_input", tool });
      const { tree, totalFiles, matchedFiles, truncated } = await scanFileList(files, {
        includeContent: contentLintOptIn,
      });
      const rootName = files[0]?.webkitRelativePath?.split("/")[0];
      setScannedTree(tree);
      setScanMeta({ totalFiles, matchedFiles, truncated, rootName });
      const paths = tree.files.map((file) => file.path);
      const overrides = applyToolDetection(paths);
      const nextTool = overrides.tool ?? tool;
      runSimulationWithTree(tree, paths, "folder", "scan", overrides);
      track("atlas_simulator_scan_complete", {
        method: "file_input",
        tool: nextTool,
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
    } finally {
      setIsScanning(false);
    }
  };

  const handleOpenDocs = () => {
    const docsUrl = "/docs";
    const opened = window.open(docsUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href = docsUrl;
    }
    announceStatus("Opening docs.");
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
    const copyError = await copyToClipboard(
      summary,
      "Summary copied to clipboard.",
      "Unable to copy summary.",
    );
    if (!copyError) {
      track("atlas_simulator_copy_summary", {
        tool,
        repoSource,
        fileCount: lastSimulatedPaths.length,
      });
    } else {
      trackError("atlas_simulator_copy_error", copyError, { tool, repoSource });
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

  const handleNextStepAction = async (action: NextStepAction, stepId: string) => {
    track("atlas_simulator_next_step_action", {
      tool,
      repoSource,
      actionId: action.id,
      stepId,
      isStale,
      fileCount: lastSimulatedPaths.length,
    });

    if (action.id === "copy-summary") {
      await handleCopySummary();
      return;
    }

    if (action.id === "download-report") {
      handleDownloadReport();
      return;
    }

    if (action.id === "refresh-results") {
      refreshResults(true);
      return;
    }

    if (action.id === "scan-folder") {
      announceStatus("Choose a folder to scan.");
      if (canPickDirectory) {
        await handleDirectoryPickerScan();
      } else {
        fileInputRef.current?.click();
      }
      return;
    }

    if (action.id === "scan-smaller-folder") {
      announceStatus("Pick a smaller folder to scan.");
      if (canPickDirectory) {
        await handleDirectoryPickerScan();
      } else {
        fileInputRef.current?.click();
      }
      return;
    }

    if (action.id === "paste-paths") {
      setRepoSource("manual");
      setShowAdvanced(true);
      requestAnimationFrame(() => scrollToElement("sim-tree-manual", true));
      announceStatus("Paste repo paths to simulate.");
      return;
    }

    if (action.id === "set-cwd") {
      openAdvancedField("sim-cwd");
      announceStatus("Set the current directory to continue.");
      return;
    }

    if (action.id === "switch-tool") {
      openAdvancedField("sim-tool");
      announceStatus("Choose the tool you want to simulate.");
      return;
    }

    if (action.id === "review-extra-files") {
      scrollToElement("sim-insights");
      announceStatus("Review extra instruction files below.");
      return;
    }

    if (action.id === "open-docs") {
      handleOpenDocs();
      return;
    }

    if (action.id === "copy-template" || action.id === "copy-base-template") {
      const template = INSTRUCTION_TEMPLATES[tool]?.root;
      if (!template) {
        announceStatus("No template available for this tool.");
        return;
      }
      const copyError = await copyToClipboard(
        template.content,
        `Copied ${template.path} template.`,
        "Unable to copy template.",
      );
      if (copyError) {
        trackError("atlas_simulator_next_step_template_error", copyError, {
          tool,
          repoSource,
          templateId: template.id,
          templatePath: template.path,
        });
      } else {
        track("atlas_simulator_next_step_template_copy", {
          tool,
          repoSource,
          templateId: template.id,
          templatePath: template.path,
          actionId: action.id,
          stepId,
        });
      }
      return;
    }

    announceStatus("Action not available yet.");
  };

  return (
    <div className="grid gap-mdt-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:gap-mdt-8">
      <Card className="p-mdt-5">
        <Stack gap={5}>
          <Stack gap={1}>
            <Heading level="h2">{quickUploadEnabled ? "Scan your repo" : "Scan setup"}</Heading>
            <Text tone="muted">
              {quickUploadEnabled
                ? "Upload a folder to see what your tool will load. Scans stay in your browser."
                : "Choose a tool, set the working directory, and scan a folder."}
            </Text>
          </Stack>

          {quickUploadEnabled ? (
            <div className="space-y-mdt-4">
              <div className="space-y-mdt-3 rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-mdt-3">
                <label className="text-caption font-semibold uppercase tracking-wide text-mdt-muted">Upload a folder</label>
                <Text tone="muted" size="bodySm">
                  {canPickDirectory
                    ? "Scans locally in your browser. File contents are never uploaded."
                    : "File System Access API isn’t supported. Use folder upload below; scans stay local."}
                </Text>
                <div className="flex flex-wrap gap-mdt-2">
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    disabled={isScanning}
                    onClick={() => {
                      if (canPickDirectory) {
                        void handleDirectoryPickerScan();
                      } else {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    {isScanning ? "Scanning…" : "Upload a folder"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setRepoSource("manual");
                      openAdvancedField("sim-tree-manual");
                    }}
                  >
                    Paste paths
                  </Button>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className={canPickDirectory ? "sr-only" : undefined}
                  // @ts-expect-error - non-standard attribute for directory uploads
                  webkitdirectory="true"
                  aria-label="Upload folder"
                  onChange={async (event) => {
                    await handleFileInputScan(event.target.files);
                  }}
                />

                {scanError ? (
                  <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2 text-caption text-[color:var(--mdt-color-danger)]">
                    {scanError}
                  </div>
                ) : null}

                {showQuickSummary ? (
                  <div className="space-y-mdt-2 rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2">
                    <Text size="bodySm" weight="semibold">
                      {detectionSummary?.title ?? `Detected: ${toolLabel(tool)}`}
                    </Text>
                    <Text tone="muted" size="bodySm">{scanCounts}</Text>
                    {detectionSummary?.body ? (
                      <Text tone="muted" size="bodySm">{detectionSummary.body}</Text>
                    ) : null}
                    <div className="flex flex-wrap gap-mdt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => openAdvancedField("sim-tool")}
                      >
                        Change tool
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => openAdvancedField("sim-cwd")}
                      >
                        Change cwd
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

              <details
                className="rounded-mdt-lg border border-mdt-border bg-mdt-surface-subtle p-mdt-3"
                open={advancedOpen}
                onToggle={(event) => setShowAdvanced((event.currentTarget as HTMLDetailsElement).open)}
              >
                <summary className="cursor-pointer text-caption font-semibold uppercase tracking-wide text-mdt-muted">
                  Show advanced
                </summary>
                <div className="mt-mdt-3 space-y-mdt-3">
                  <div className="space-y-mdt-2 rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2">
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

                  <div className="space-y-mdt-2 rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2">
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

                  <div className="space-y-mdt-2 rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2">
                    <Text as="h4" size="caption" weight="semibold" tone="muted" className="uppercase tracking-wide">
                      Scan preview
                    </Text>
                    {scanMeta ? <SimulatorScanMeta {...scanMeta} /> : null}
                    <TextArea
                      id="sim-tree-preview"
                      rows={8}
                      value={scannedPreview}
                      readOnly
                      placeholder="Scanned paths will appear here."
                    />
                  </div>

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

                  <div className="space-y-mdt-2 rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-3 py-mdt-2">
                    <Text as="h4" size="caption" weight="semibold" tone="muted" className="uppercase tracking-wide">
                      Paste repo paths
                    </Text>
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

                  <Text tone="muted" size="bodySm">
                    {repoFileCount} file(s) in the current source. Lines starting with `#` or `//` are ignored.
                  </Text>
                </div>
              </details>

            </div>
          ) : (
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
                      onClick={() => {
                        void handleDirectoryPickerScan();
                      }}
                    >
                      {isScanning ? "Scanning…" : "Scan a folder"}
                    </Button>
                  ) : (
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      // @ts-expect-error - non-standard attribute for directory uploads
                      webkitdirectory="true"
                      aria-label="Upload folder"
                      onChange={async (event) => {
                        await handleFileInputScan(event.target.files);
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
          )}

          {!quickUploadEnabled || isStale ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => refreshResults()}
            >
              Refresh results
            </Button>
          ) : null}
        </Stack>
      </Card>

      <Card className="p-mdt-5">
        <Stack gap={5}>
          <Stack gap={2}>
            <Heading level="h2">Results</Heading>
            <Text tone="muted">Start with Next steps, then review what loads and any warnings.</Text>
            {isStale ? (
              <div
                className="rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-mdt-3 py-mdt-2 text-caption text-mdt-muted"
                role="status"
              >
                Results are out of date. Refresh results to update.
              </div>
            ) : null}
          </Stack>

          <div className="space-y-mdt-4">
            {featureFlags.scanNextStepsV1 ? (
              <NextStepsPanel
                steps={nextSteps}
                subtitle="Start with the highest-impact fix, then refresh results."
                onAction={(action, step) => {
                  void handleNextStepAction(action, step.id);
                }}
              />
            ) : null}
            {featureFlags.instructionHealthV1 ? (
              <InstructionHealthPanel diagnostics={instructionDiagnostics} copySummaryText={fixSummaryText} />
            ) : null}
            {featureFlags.instructionHealthV1 ? (
              <InstructionContentLint enabled={contentLintOptIn} result={contentLintResult} />
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

            <div id="sim-insights">
              <SimulatorInsights insights={insights} extraFiles={extraInstructionFiles} />
            </div>

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
