import { describe, expect, it } from 'vitest';
import { scanFileList } from '@/lib/atlas/simulators/fileListScan';

describe('atlas/simulators/fileListScan', () => {
  it('normalizes relative paths, ignores directories, and returns metadata', () => {
    const guardedFile = { name: 'AGENTS.md', webkitRelativePath: 'repo/AGENTS.md' };
    Object.defineProperty(guardedFile, 'text', {
      value: () => {
        throw new Error('should not read');
      },
    });

    const result = scanFileList(
      [
        guardedFile,
        { name: 'ignored.txt', webkitRelativePath: 'repo/node_modules/ignored.txt' },
        { name: 'AGENTS.md', webkitRelativePath: 'repo/apps/web/AGENTS.md' },
      ],
      { ignoreDirs: ['node_modules'] },
    );

    expect(result.truncated).toBe(false);
    expect(result.totalFiles).toBe(2);
    expect(result.matchedFiles).toBe(2);
    expect(result.tree.files.map(file => file.path)).toEqual(['AGENTS.md', 'apps/web/AGENTS.md']);
    expect(result.tree.files.every(file => file.content === '')).toBe(true);
  });

  it('applies includeOnly patterns and truncates at maxFiles', () => {
    const result = scanFileList(
      [
        { name: 'AGENTS.md', webkitRelativePath: 'repo/AGENTS.md' },
        { name: 'README.md', webkitRelativePath: 'repo/README.md' },
        { name: 'GEMINI.md', webkitRelativePath: 'repo/GEMINI.md' },
      ],
      { includeOnly: [/AGENTS\.md$/], maxFiles: 2, ignoreDirs: [] },
    );

    expect(result.truncated).toBe(true);
    expect(result.totalFiles).toBe(2);
    expect(result.matchedFiles).toBe(1);
    expect(result.tree.files.map(file => file.path)).toEqual(['AGENTS.md']);
    expect(result.tree.files.every(file => file.content === '')).toBe(true);
  });
});
