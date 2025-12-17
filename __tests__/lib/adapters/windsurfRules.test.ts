import { describe, expect, it } from 'vitest';
import { windsurfRulesAdapter } from '@/lib/adapters/windsurfRules';
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

describe('Windsurf rules v1 adapter', () => {
  it('emits global_rules.md and .windsurf/rules/*.md for scoped blocks', async () => {
    const uam = uamFixture({
      scopes: [
        { id: 'global', kind: 'global' },
        { id: 'src', kind: 'dir', dir: 'src' },
        { id: 'ts', kind: 'glob', name: 'typescript', patterns: ['src/**/*.ts'] },
      ],
      blocks: [
        { id: 'b1', scopeId: 'global', kind: 'markdown', body: 'Global rules' },
        { id: 'b2', scopeId: 'src', kind: 'markdown', body: 'Src rules' },
        { id: 'b3', scopeId: 'ts', kind: 'markdown', body: 'TS rules' },
      ],
    });

    const result = await windsurfRulesAdapter.compile(uam);

    expect(result.warnings).toHaveLength(0);
    expect(result.files.map(f => f.path)).toEqual([
      '.windsurf/rules/src.md',
      '.windsurf/rules/typescript.md',
      'global_rules.md',
    ]);

    expect(result.files.find(f => f.path === 'global_rules.md')?.content).toBe('Global rules\n');

    expect(result.files.find(f => f.path === '.windsurf/rules/src.md')?.content).toBe(
      ['# Rules for src', '', 'Src rules', ''].join('\n')
    );

    expect(result.files.find(f => f.path === '.windsurf/rules/typescript.md')?.content).toBe(
      ['# Rules for src/**/*.ts', '', 'TS rules', ''].join('\n')
    );
  });
});

