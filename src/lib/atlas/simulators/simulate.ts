import type { LoadedFile, RepoTree, SimulationInput, SimulationResult, SimulationWarning } from './types.ts';
import { simulateClaudeCode } from './tools/claudeCode.ts';
import { simulateCopilotCli } from './tools/copilotCli.ts';
import { simulateCodexCli } from './tools/codexCli.ts';
import { simulateCursorRules } from './tools/cursorRules.ts';
import { simulateGeminiCli } from './tools/geminiCli.ts';
import { simulateGitHubCopilot } from './tools/githubCopilot.ts';

type TreeIndex = {
  has: (filePath: string) => boolean;
  listPaths: () => string[];
  getContent: (filePath: string) => string | null;
};

function normalizePath(value: string): string {
  const normalized = value.replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/\/+$/, '');
  if (!normalized || normalized === '.') return '';
  return normalized;
}

function buildIndex(tree: RepoTree): TreeIndex {
  const paths = new Set<string>();
  const content = new Map<string, string>();

  for (const file of tree.files) {
    const normalized = normalizePath(file.path);
    if (!normalized) continue;
    paths.add(normalized);
    if (file.content) {
      content.set(normalized, file.content);
    }
  }

  return {
    has: (filePath: string) => paths.has(normalizePath(filePath)),
    listPaths: () => Array.from(paths).sort(),
    getContent: (filePath: string) => content.get(normalizePath(filePath)) ?? null,
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
  if (cursorRules.length > 0 && paths.includes('.cursorrules')) {
    warnings.push({
      code: 'deprecated.cursorrules',
      message: 'Legacy .cursorrules found alongside .cursor/rules.',
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
    if (tool === 'cursor') return simulateCursorRules(indexed);
    return [];
  })();

  return {
    loaded: dedupeLoaded(loaded),
    warnings,
  };
}
