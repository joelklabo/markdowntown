import type { LoadedFile, RepoTree, SimulationInput, SimulationResult, SimulationWarning } from './types.ts';
import { simulateClaudeCode } from './tools/claudeCode.ts';
import { simulateCopilotCli } from './tools/copilotCli.ts';
import { simulateCodexCli } from './tools/codexCli.ts';
import { simulateGeminiCli } from './tools/geminiCli.ts';
import { simulateGitHubCopilot } from './tools/githubCopilot.ts';

type TreeIndex = {
  has: (filePath: string) => boolean;
  listPaths: () => string[];
};

function normalizePath(value: string): string {
  const normalized = value.replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/\/+$/, '');
  if (!normalized || normalized === '.') return '';
  return normalized;
}

function buildIndex(tree: RepoTree): TreeIndex {
  const paths = new Set<string>();

  for (const file of tree.files) {
    paths.add(normalizePath(file.path));
  }

  return {
    has: (filePath: string) => paths.has(normalizePath(filePath)),
    listPaths: () => Array.from(paths).sort(),
  };
}

function dedupeLoaded(items: LoadedFile[]): LoadedFile[] {
  const seen = new Set<string>();
  const out: LoadedFile[] = [];
  for (const item of items) {
    if (seen.has(item.path)) continue;
    seen.add(item.path);
    out.push(item);
  }
  return out;
}

function computeWarnings(tree: TreeIndex): SimulationWarning[] {
  const warnings: SimulationWarning[] = [];
  const paths = tree.listPaths();

  const total = paths.length;
  if (total > 25) {
    warnings.push({
      code: 'scan-risk.large-tree',
      message: `Tree contains ${total} files; downward scans may explode context.`,
    });
  }

  const cursorRules = paths.filter(path => path.startsWith('.cursor/rules/'));
  if (cursorRules.length > 10) {
    warnings.push({
      code: 'scan-risk.cursor-rules',
      message: `.cursor/rules contains ${cursorRules.length} files.`,
    });
  }

  return warnings;
}

export function simulateContextResolution({ tool, tree, cwd }: SimulationInput): SimulationResult {
  const indexed = buildIndex(tree);
  const warnings = computeWarnings(indexed);

  const loaded = (() => {
    if (tool === 'github-copilot') return simulateGitHubCopilot(indexed);
    if (tool === 'copilot-cli') return simulateCopilotCli(indexed);
    if (tool === 'claude-code') return simulateClaudeCode(indexed, cwd);
    if (tool === 'gemini-cli') return simulateGeminiCli(indexed, cwd);
    if (tool === 'codex-cli') return simulateCodexCli(indexed, cwd);
    return [];
  })();

  return {
    loaded: dedupeLoaded(loaded),
    warnings,
  };
}
