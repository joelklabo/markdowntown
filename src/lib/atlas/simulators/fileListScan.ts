import type { RepoScanResult, RepoTree, RepoTreeFile } from './types.ts';
import { DEFAULT_IGNORE_DIRS, DEFAULT_MAX_FILES } from './fsScan.ts';
import { readInstructionContent, type ContentScanOptions } from './contentScan.ts';

export type FileLike = {
  name: string;
  webkitRelativePath?: string;
  size?: number;
  text?: () => Promise<string>;
};

export type FileListLike = Array<FileLike> | { length: number; item: (index: number) => FileLike | null };

export type FileListScanOptions = {
  ignoreDirs?: string[];
  maxFiles?: number;
  includeOnly?: RegExp[];
  includeContent?: boolean;
  contentAllowlist?: RegExp[];
  maxContentBytes?: number;
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

export async function scanFileList(files: FileListLike, options: FileListScanOptions = {}): Promise<RepoScanResult> {
  const ignoreDirs = new Set(options.ignoreDirs ?? DEFAULT_IGNORE_DIRS);
  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;
  const includeOnly = options.includeOnly;
  const includeContent = options.includeContent ?? false;
  const contentOptions: ContentScanOptions = {
    allowlist: options.contentAllowlist,
    maxBytes: options.maxContentBytes,
  };
  const entries: RepoTreeFile[] = [];

  let totalFiles = 0;
  let matchedFiles = 0;
  let truncated = false;

  for (const file of toArray(files)) {
    if (totalFiles >= maxFiles) {
      truncated = true;
      break;
    }

    // Guardrail: only read content when opted-in and allowlisted.
    const path = toRepoPath(file);
    if (!path) continue;
    if (containsIgnoredDir(path, ignoreDirs)) continue;

    totalFiles += 1;

    if (shouldInclude(path, includeOnly)) {
      let content = '';
      let contentStatus: RepoTreeFile['contentStatus'];
      let contentReason: RepoTreeFile['contentReason'];
      if (includeContent && typeof file.text === 'function') {
        const result = await readInstructionContent(
          path,
          async () => ({ size: file.size, text: file.text!.bind(file) }),
          contentOptions,
        );
        if (result.content !== null) {
          content = result.content;
          contentStatus = result.truncated ? 'truncated' : 'loaded';
        } else if (result.skipped) {
          contentStatus = 'skipped';
          contentReason = result.reason;
        }
      } else if (includeContent) {
        contentStatus = 'skipped';
        contentReason = 'unreadable';
      }
      entries.push({ path, content, contentStatus, contentReason });
      matchedFiles += 1;
    }
  }

  const tree: RepoTree = {
    files: entries,
  };

  return { tree, totalFiles, matchedFiles, truncated };
}
