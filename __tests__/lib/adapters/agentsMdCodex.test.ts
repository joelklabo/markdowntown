import { describe, expect, it } from 'vitest';
import { agentsMdCodexAdapter } from '@/lib/adapters/agentsMdCodex';
import type { UamV1 } from '@/lib/uam/uamTypes';

function uamFixture(overrides: Partial<UamV1> = {}): UamV1 {
  return {
    schemaVersion: 1,
    meta: { title: 'Test' },
    scopes: [],
    blocks: [],
    capabilities: [],
    targets: [],
    ...overrides,
  };
}

describe('AGENTS.md (Codex) v1 adapter', () => {
  it('compiles global and directory scopes to AGENTS.md files', async () => {
    const uam = uamFixture({
      scopes: [
        { id: 'global', kind: 'global' },
        { id: 'src', kind: 'dir', dir: 'src' },
        { id: 'lib', kind: 'dir', dir: 'src/lib/' },
      ],
      blocks: [
        { id: 'b1', scopeId: 'global', kind: 'markdown', body: 'Root content' },
        { id: 'b2', scopeId: 'src', kind: 'markdown', body: 'Src content' },
        { id: 'b3', scopeId: 'lib', kind: 'markdown', body: 'Lib content' },
      ],
    });

    const result = await agentsMdCodexAdapter.compile(uam);

    expect(result.warnings).toHaveLength(0);
    expect(result.files.map(f => f.path)).toEqual(['AGENTS.md', 'src/AGENTS.md', 'src/lib/AGENTS.md']);

    expect(result.files.find(f => f.path === 'AGENTS.md')?.content).toBe('Root content');
    expect(result.files.find(f => f.path === 'src/AGENTS.md')?.content).toBe('Src content');
    expect(result.files.find(f => f.path === 'src/lib/AGENTS.md')?.content).toBe('Lib content');
  });

  it('warns on glob scopes and skips them', async () => {
    const uam = uamFixture({
      scopes: [{ id: 'g1', kind: 'glob', patterns: ['src/**/*.ts'] }],
      blocks: [{ id: 'b1', scopeId: 'g1', kind: 'markdown', body: 'Bad content' }],
    });

    const result = await agentsMdCodexAdapter.compile(uam);

    expect(result.files).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('glob scope');
  });

  it('handles duplicate directory paths deterministically', async () => {
    const uam = uamFixture({
      scopes: [
        { id: 's1', kind: 'dir', dir: 'src' },
        { id: 's2', kind: 'dir', dir: 'src/' },
      ],
      blocks: [
        { id: 'b1', scopeId: 's1', kind: 'markdown', body: 'One' },
        { id: 'b2', scopeId: 's2', kind: 'markdown', body: 'Two' },
      ],
    });

    const result = await agentsMdCodexAdapter.compile(uam);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.path).toBe('src/AGENTS.md');
    expect(result.files[0]?.content).toBe('One\n\nTwo');
    expect(result.warnings.some(w => w.includes('Multiple scopes map'))).toBe(true);
  });
});

