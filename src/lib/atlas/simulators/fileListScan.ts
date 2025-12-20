import type { RepoScanResult, RepoTree } from './types.ts';
import { DEFAULT_IGNORE_DIRS, DEFAULT_MAX_FILES } from './fsScan.ts';

export type FileLike = {
  name: string;
  webkitRelativePath?: string;
};

export type FileListLike = Array<FileLike> | { length: number; item: (index: number) => FileLike | null };

export type FileListScanOptions = {
  ignoreDirs?: string[];
  maxFiles?: number;
  includeOnly?: RegExp[];
};

function normalizePath(value: string): string {
  const normalized = value.replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/\/+$/, '');
  if (!normalized || normalized === '.') return '';
  return normalized;
}

function stripRootFolder(path: string, usedRelativePath: boolean): string {
  if (!usedRelativePath) return path;
  const parts = path.split('/');
  if (parts.length <= 1) return path;
  return parts.slice(1).join('/');
}

function shouldInclude(path: string, includeOnly?: RegExp[]): boolean {
  if (!includeOnly || includeOnly.length === 0) return true;
  return includeOnly.some((pattern) => pattern.test(path));
}

function containsIgnoredDir(path: string, ignoreDirs: Set<string>): boolean {
  if (ignoreDirs.size === 0) return false;
  const segments = path.split('/');
  return segments.some((segment) => ignoreDirs.has(segment));
}

function toArray(list: FileListLike): FileLike[] {
  if (Array.isArray(list)) return list;
  const out: FileLike[] = [];
  for (let i = 0; i < list.length; i += 1) {
    const item = list.item(i);
    if (item) out.push(item);
  }
  return out;
}

function toRepoPath(file: FileLike): string {
  const hasRelative = !!file.webkitRelativePath && file.webkitRelativePath.includes('/');
  const raw = hasRelative ? file.webkitRelativePath! : file.name;
  const normalized = normalizePath(raw);
  return stripRootFolder(normalized, hasRelative);
}

export function scanFileList(files: FileListLike, options: FileListScanOptions = {}): RepoScanResult {
  const ignoreDirs = new Set(options.ignoreDirs ?? DEFAULT_IGNORE_DIRS);
  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;
  const includeOnly = options.includeOnly;
  const paths: string[] = [];

  let totalFiles = 0;
  let matchedFiles = 0;
  let truncated = false;

  for (const file of toArray(files)) {
    if (totalFiles >= maxFiles) {
      truncated = true;
      break;
    }

    const path = toRepoPath(file);
    if (!path) continue;
    if (containsIgnoredDir(path, ignoreDirs)) continue;

    totalFiles += 1;

    if (shouldInclude(path, includeOnly)) {
      paths.push(path);
      matchedFiles += 1;
    }
  }

  const tree: RepoTree = {
    files: paths.map((path) => ({ path, content: '' })),
  };

  return { tree, totalFiles, matchedFiles, truncated };
}
