import type { LoadedFile } from '../types.ts';

type TreeReader = {
  has: (filePath: string) => boolean;
};

export function simulateGitHubCopilot(tree: TreeReader): LoadedFile[] {
  const loaded: LoadedFile[] = [];

  if (tree.has('.github/copilot-instructions.md')) {
    loaded.push({
      path: '.github/copilot-instructions.md',
      reason: 'repo instructions (.github/copilot-instructions.md)',
    });
  }

  return loaded;
}
