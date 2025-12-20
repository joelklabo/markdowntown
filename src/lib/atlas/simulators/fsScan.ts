import type { RepoTree } from './types.ts';

export type FileSystemHandleLike = {
  kind: 'file' | 'directory';
  name: string;
};

export type FileSystemDirectoryHandleLike = FileSystemHandleLike & {
  kind: 'directory';
  entries: () => AsyncIterable<[string, FileSystemHandleLike]>;
};

export type FsScanOptions = {
  ignoreDirs?: string[];
  maxFiles?: number;
  includeOnly?: RegExp[];
};

export type FsScanResult = {
  tree: RepoTree;
  totalFiles: number;
  matchedFiles: number;
  truncated: boolean;
};

export const DEFAULT_IGNORE_DIRS = [
  '.git',
  '.next',
  '.beads',
  'node_modules',
  'dist',
  'build',
  'coverage',
  'test-results',
];

export const DEFAULT_MAX_FILES = 5000;

function joinPath(prefix: string, name: string): string {
  return prefix ? `${prefix}/${name}` : name;
}

async function walk(
  dir: FileSystemDirectoryHandleLike,
  prefix: string,
  ignoreDirs: Set<string>,
  maxFiles: number,
  includeOnly: RegExp[] | undefined,
  out: string[],
): Promise<{ totalFiles: number; matchedFiles: number; truncated: boolean }> {
  let totalFiles = 0;
  let matchedFiles = 0;

  for await (const [name, handle] of dir.entries()) {
    if (totalFiles >= maxFiles) {
      return { totalFiles, matchedFiles, truncated: true };
    }

    if (!handle || typeof handle.kind !== 'string') continue;

    if (handle.kind === 'directory') {
      if (ignoreDirs.has(name)) continue;
      const nextPrefix = joinPath(prefix, name);
      const result = await walk(
        handle as FileSystemDirectoryHandleLike,
        nextPrefix,
        ignoreDirs,
        maxFiles,
        includeOnly,
        out,
      );
      totalFiles += result.totalFiles;
      matchedFiles += result.matchedFiles;
      if (result.truncated) return { totalFiles, matchedFiles, truncated: true };
      continue;
    }

    if (handle.kind === 'file') {
      // Guardrail: never read file contents; collect paths only.
      totalFiles += 1;
      const path = joinPath(prefix, name);
      if (!includeOnly || includeOnly.some((pattern) => pattern.test(path))) {
        out.push(path);
        matchedFiles += 1;
      }
    }
  }

  return { totalFiles, matchedFiles, truncated: false };
}

export async function scanRepoTree(
  root: FileSystemDirectoryHandleLike,
  options: FsScanOptions = {},
): Promise<FsScanResult> {
  const ignoreDirs = new Set(options.ignoreDirs ?? DEFAULT_IGNORE_DIRS);
  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;
  const includeOnly = options.includeOnly;
  const paths: string[] = [];

  const { totalFiles, matchedFiles, truncated } = await walk(root, '', ignoreDirs, maxFiles, includeOnly, paths);

  const tree: RepoTree = {
    files: paths.map((path) => ({ path, content: '' })),
  };

  return { tree, totalFiles, matchedFiles, truncated };
}
