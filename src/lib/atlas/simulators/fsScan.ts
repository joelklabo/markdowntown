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
};

export type FsScanResult = {
  tree: RepoTree;
  totalFiles: number;
  truncated: boolean;
};

const DEFAULT_IGNORE_DIRS = [
  '.git',
  '.next',
  '.beads',
  'node_modules',
  'dist',
  'build',
  'coverage',
  'test-results',
];

const DEFAULT_MAX_FILES = 5000;

function joinPath(prefix: string, name: string): string {
  return prefix ? `${prefix}/${name}` : name;
}

async function walk(
  dir: FileSystemDirectoryHandleLike,
  prefix: string,
  ignoreDirs: Set<string>,
  maxFiles: number,
  out: string[],
): Promise<{ totalFiles: number; truncated: boolean }> {
  let totalFiles = 0;

  for await (const [name, handle] of dir.entries()) {
    if (out.length >= maxFiles) {
      return { totalFiles, truncated: true };
    }

    if (!handle || typeof handle.kind !== 'string') continue;

    if (handle.kind === 'directory') {
      if (ignoreDirs.has(name)) continue;
      const nextPrefix = joinPath(prefix, name);
      const result = await walk(handle as FileSystemDirectoryHandleLike, nextPrefix, ignoreDirs, maxFiles, out);
      totalFiles += result.totalFiles;
      if (result.truncated) return { totalFiles, truncated: true };
      continue;
    }

    if (handle.kind === 'file') {
      out.push(joinPath(prefix, name));
      totalFiles += 1;
    }
  }

  return { totalFiles, truncated: false };
}

export async function scanRepoTree(
  root: FileSystemDirectoryHandleLike,
  options: FsScanOptions = {},
): Promise<FsScanResult> {
  const ignoreDirs = new Set(options.ignoreDirs ?? DEFAULT_IGNORE_DIRS);
  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;
  const paths: string[] = [];

  const { totalFiles, truncated } = await walk(root, '', ignoreDirs, maxFiles, paths);

  const tree: RepoTree = {
    files: paths.map((path) => ({ path, content: '' })),
  };

  return { tree, totalFiles, truncated };
}

