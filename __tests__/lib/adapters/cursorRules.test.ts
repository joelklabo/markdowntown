import { describe, expect, it } from 'vitest';
import { cursorRulesAdapter } from '@/lib/adapters/cursorRules';
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

describe('Cursor rules v1 adapter', () => {
  it('writes global rules as alwaysApply: true', async () => {
    const uam = uamFixture({
      scopes: [{ id: 'global', kind: 'global' }],
      blocks: [{ id: 'b1', scopeId: 'global', kind: 'markdown', body: 'Global body' }],
    });

    const result = await cursorRulesAdapter.compile(uam);

    expect(result.warnings).toHaveLength(0);
    expect(result.files.map(f => f.path)).toEqual(['.cursor/rules/global.mdc']);
    expect(result.files[0]?.content).toBe(
      [
        '---',
        'description: "Global rules"',
        'globs:',
        '  - "**/*"',
        'alwaysApply: true',
        '---',
        '',
        'Global body',
        '',
      ].join('\n')
    );
  });

  it('writes scoped rules with globs and alwaysApply: false', async () => {
    const uam = uamFixture({
      scopes: [
        { id: 'global', kind: 'global' },
        { id: 'src', kind: 'dir', dir: 'src' },
        { id: 'ts', kind: 'glob', name: 'typescript', patterns: ['src/**/*.ts'] },
      ],
      blocks: [
        { id: 'b1', scopeId: 'global', kind: 'markdown', body: 'Global body' },
        { id: 'b2', scopeId: 'src', kind: 'markdown', body: 'Src body' },
        { id: 'b3', scopeId: 'ts', kind: 'markdown', body: 'TS body' },
      ],
    });

    const result = await cursorRulesAdapter.compile(uam);

    expect(result.warnings).toHaveLength(0);
    expect(result.files.map(f => f.path)).toEqual([
      '.cursor/rules/global.mdc',
      '.cursor/rules/src.mdc',
      '.cursor/rules/typescript.mdc',
    ]);

    expect(result.files.find(f => f.path === '.cursor/rules/src.mdc')?.content).toBe(
      [
        '---',
        'description: "Rules for src"',
        'globs:',
        '  - "src/**"',
        'alwaysApply: false',
        '---',
        '',
        'Src body',
        '',
      ].join('\n')
    );

    expect(result.files.find(f => f.path === '.cursor/rules/typescript.mdc')?.content).toBe(
      [
        '---',
        'description: "typescript"',
        'globs:',
        '  - "src/**/*.ts"',
        'alwaysApply: false',
        '---',
        '',
        'TS body',
        '',
      ].join('\n')
    );
  });
});

