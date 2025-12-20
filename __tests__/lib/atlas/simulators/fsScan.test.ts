import { describe, expect, it } from 'vitest';
import { scanRepoTree, type FileSystemHandleLike, type FileSystemDirectoryHandleLike } from '@/lib/atlas/simulators/fsScan';

function file(name: string): FileSystemHandleLike {
  return { kind: 'file', name };
}

function dir(name: string, children: FileSystemHandleLike[]): FileSystemDirectoryHandleLike {
  return {
    kind: 'directory',
    name,
    async *entries() {
      for (const child of children) {
        yield [child.name, child];
      }
    },
  };
}

describe('atlas/simulators/fsScan', () => {
  it('walks directories and returns repo-relative paths', async () => {
    const root = dir('repo', [
      file('AGENTS.md'),
      dir('node_modules', [file('ignored.txt')]),
      dir('apps', [dir('web', [file('AGENTS.md')])]),
    ]);

    const result = await scanRepoTree(root, { ignoreDirs: ['node_modules'], includeOnly: [/AGENTS\.md$/] });

    expect(result.truncated).toBe(false);
    expect(result.totalFiles).toBe(2);
    expect(result.matchedFiles).toBe(2);
    expect(result.tree.files.map(f => f.path)).toEqual(['AGENTS.md', 'apps/web/AGENTS.md']);
  });

  it('filters by includeOnly patterns and reports matched counts', async () => {
    const root = dir('repo', [
      file('AGENTS.md'),
      file('README.md'),
      dir('apps', [dir('web', [file('GEMINI.md')])]),
    ]);

    const result = await scanRepoTree(root, { ignoreDirs: [], includeOnly: [/AGENTS\.md$/, /GEMINI\.md$/] });

    expect(result.totalFiles).toBe(3);
    expect(result.matchedFiles).toBe(2);
    expect(result.tree.files.map(f => f.path)).toEqual(['AGENTS.md', 'apps/web/GEMINI.md']);
  });

  it('stops scanning when maxFiles is reached', async () => {
    const root = dir('repo', [file('a.txt'), file('b.txt'), file('c.txt')]);
    const result = await scanRepoTree(root, { maxFiles: 2, ignoreDirs: [] });

    expect(result.truncated).toBe(true);
    expect(result.totalFiles).toBe(2);
    expect(result.matchedFiles).toBe(2);
    expect(result.tree.files).toHaveLength(2);
  });
});
