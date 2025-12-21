import type { RepoTree } from './types.ts';
import { DEFAULT_MAX_CONTENT_BYTES, isAllowlistedInstructionPath } from './contentScan.ts';

export type ContentLintSeverity = 'error' | 'warning' | 'info';

export type ContentLintIssue = {
  code: string;
  severity: ContentLintSeverity;
  message: string;
  suggestion?: string;
  path: string;
};

export type ContentLintResult = {
  issues: ContentLintIssue[];
  checkedFiles: number;
  skippedFiles: number;
};

function isScopedCopilotInstruction(path: string): boolean {
  return (
    (path.startsWith('.github/instructions/') || path.startsWith('.github/copilot-instructions/')) &&
    path.endsWith('.instructions.md')
  );
}

function isRootInstruction(path: string): boolean {
  return (
    path === 'AGENTS.md' ||
    path === 'CLAUDE.md' ||
    path === 'GEMINI.md' ||
    path === '.github/copilot-instructions.md'
  );
}

function hasApplyToFrontMatter(content: string): boolean {
  const match = content.match(/^---\s*[\r\n]+([\s\S]*?)\r?\n---/);
  if (!match) return false;
  return /applyTo\s*:/i.test(match[1]);
}

function hasCommandHints(content: string): boolean {
  const haystack = content.toLowerCase();
  const hints = ['pnpm', 'npm', 'yarn', 'bun', 'test', 'lint', 'type-check', 'typecheck', 'install'];
  return hints.some((hint) => haystack.includes(hint));
}

export function lintInstructionContent(tree: RepoTree): ContentLintResult {
  const issues: ContentLintIssue[] = [];
  let checkedFiles = 0;
  let skippedFiles = 0;

  for (const file of tree.files) {
    if (!isAllowlistedInstructionPath(file.path)) continue;

    if (file.contentStatus === 'skipped') {
      skippedFiles += 1;
      if (file.contentReason === 'too-large') {
        issues.push({
          code: 'content-too-large',
          severity: 'warning',
          message: `Instruction file is larger than ${Math.round(DEFAULT_MAX_CONTENT_BYTES / 1024)} KB and was skipped.`,
          suggestion: 'Trim the file or split instructions into scoped files.',
          path: file.path,
        });
      }
      continue;
    }

    const content = file.content ?? '';
    if (!content) continue;

    checkedFiles += 1;

    if (file.contentStatus === 'truncated') {
      issues.push({
        code: 'content-truncated',
        severity: 'warning',
        message: `Instruction content was truncated at ${Math.round(DEFAULT_MAX_CONTENT_BYTES / 1024)} KB.`,
        suggestion: 'Trim the file or split instructions into scoped files.',
        path: file.path,
      });
    }

    if (isScopedCopilotInstruction(file.path) && !hasApplyToFrontMatter(content)) {
      issues.push({
        code: 'missing-front-matter',
        severity: 'warning',
        message: 'Scoped Copilot instructions should include applyTo front matter.',
        suggestion: 'Add a YAML header like: ---\napplyTo: "**/*"\n---',
        path: file.path,
      });
    }

    if (isRootInstruction(file.path) && !hasCommandHints(content)) {
      issues.push({
        code: 'missing-commands',
        severity: 'info',
        message: 'Consider adding install/test/lint commands to your instructions.',
        suggestion: 'Include common commands (install, test, lint) so tooling runs are clear.',
        path: file.path,
      });
    }
  }

  return { issues, checkedFiles, skippedFiles };
}
