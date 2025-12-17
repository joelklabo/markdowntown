import { describe, expect, it } from 'vitest';
import { githubCopilotAdapter } from '@/lib/adapters/githubCopilot';
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

describe('GitHub Copilot v1 adapter', () => {
  it('emits global scope to .github/copilot-instructions.md', async () => {
    const uam = uamFixture({
      scopes: [{ id: 'global', kind: 'global' }],
      blocks: [
        { id: 'b1', scopeId: 'global', kind: 'markdown', body: 'One' },
        { id: 'b2', scopeId: 'global', kind: 'markdown', body: 'Two' },
      ],
    });

    const result = await githubCopilotAdapter.compile(uam);

    expect(result.warnings).toHaveLength(0);
    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.path).toBe('.github/copilot-instructions.md');
    expect(result.files[0]?.content).toContain('One');
    expect(result.files[0]?.content).toContain('Two');
  });

  it('emits glob scopes to .github/instructions/*.instructions.md with applyTo', async () => {
    const uam = uamFixture({
      scopes: [{ id: 's1', kind: 'glob', name: 'typescript', patterns: ['src/**/*.ts'] }],
      blocks: [{ id: 'b1', scopeId: 's1', kind: 'markdown', body: 'TS rules' }],
    });

    const result = await githubCopilotAdapter.compile(uam);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.path).toBe('.github/instructions/typescript.instructions.md');
    expect(result.files[0]?.content).toContain('applyTo: "src/**/*.ts"');
    expect(result.files[0]?.content).toContain('TS rules');
  });

  it('formats multiple applyTo globs as a YAML list', async () => {
    const uam = uamFixture({
      scopes: [
        { id: 's1', kind: 'glob', name: 'frontend', patterns: ['src/**/*.tsx', 'src/**/*.ts'] },
      ],
      blocks: [{ id: 'b1', scopeId: 's1', kind: 'markdown', body: 'Frontend rules' }],
    });

    const result = await githubCopilotAdapter.compile(uam);

    expect(result.files).toHaveLength(1);
    const content = result.files[0]?.content ?? '';
    expect(content).toContain('applyTo:');
    expect(content).toContain('  - "src/**/*.ts"');
    expect(content).toContain('  - "src/**/*.tsx"');
  });

  it('warns on non-glob scoped blocks and does not silently mis-scope', async () => {
    const uam = uamFixture({
      scopes: [{ id: 's1', kind: 'dir', dir: 'src' }],
      blocks: [{ id: 'b1', scopeId: 's1', kind: 'markdown', body: 'Do not mis-scope me' }],
    });

    const result = await githubCopilotAdapter.compile(uam);

    expect(result.files).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('directory scope');
  });

  it('handles scope name collisions deterministically', async () => {
    const uam = uamFixture({
      scopes: [
        { id: 'a', kind: 'glob', name: 'rules', patterns: ['src/**/*.ts'] },
        { id: 'b', kind: 'glob', name: 'rules', patterns: ['src/**/*.tsx'] },
      ],
      blocks: [
        { id: 'b1', scopeId: 'a', kind: 'markdown', body: 'A rules' },
        { id: 'b2', scopeId: 'b', kind: 'markdown', body: 'B rules' },
      ],
    });

    const result = await githubCopilotAdapter.compile(uam);

    expect(result.files.map(f => f.path)).toEqual([
      '.github/instructions/rules-2.instructions.md',
      '.github/instructions/rules.instructions.md',
    ]);
  });
});

