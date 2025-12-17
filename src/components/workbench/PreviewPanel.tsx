'use client';

import React from 'react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import type { UamScopeV1 } from '@/lib/uam/uamTypes';

function scopeLabel(scope: UamScopeV1): string {
  if (scope.name && scope.name.trim().length > 0) return scope.name;
  if (scope.kind === 'global') return 'Global';
  if (scope.kind === 'dir') return scope.dir;
  return scope.patterns.join(', ');
}

function blockLabel(block: { kind: string; title?: string }) {
  const title = block.title?.trim();
  if (title && title.length > 0) return title;
  return block.kind.toUpperCase();
}

function renderScopeMarkdown(scope: UamScopeV1, blocks: Array<{ kind: string; title?: string; body: string }>): string {
  const header = scope.kind === 'global' ? '## Global' : `## ${scopeLabel(scope)}`;

  if (blocks.length === 0) return `${header}\n\n_(no blocks)_`;

  const renderedBlocks = blocks.map((b) => {
    const title = blockLabel(b);
    const body = b.body.trimEnd();
    return `### ${title}\n\n${body.length > 0 ? body : '_(empty)_'}`;
  });

  return `${header}\n\n${renderedBlocks.join('\n\n---\n\n')}`;
}

export function PreviewPanel() {
  const uam = useWorkbenchStore(s => s.uam);
  const selectedScopeId = useWorkbenchStore(s => s.selectedScopeId);

  const [mode, setMode] = React.useState<'selected' | 'all'>('selected');

  const scopes = uam.scopes;
  const blocks = uam.blocks;

  const scopesToRender = React.useMemo(() => {
    if (mode === 'all') return scopes;
    const selected = scopes.find(s => s.id === selectedScopeId);
    return selected ? [selected] : scopes.slice(0, 1);
  }, [mode, scopes, selectedScopeId]);

  const markdown = React.useMemo(() => {
    const header = `# ${uam.meta.title}${uam.meta.description ? `\n\n${uam.meta.description}` : ''}`;
    const sections = scopesToRender.map(scope => {
      const scoped = blocks.filter(b => b.scopeId === scope.id);
      return renderScopeMarkdown(scope, scoped);
    });
    return `${header}\n\n${sections.join('\n\n---\n\n')}`.trimEnd();
  }, [uam.meta.title, uam.meta.description, scopesToRender, blocks]);

  return (
    <div className="h-full overflow-auto p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-body-sm text-mdt-muted uppercase tracking-wider">Preview</span>
        <label className="text-caption text-mdt-muted flex items-center gap-2">
          <span>Show</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'selected' | 'all')}
            className="h-8 rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-2 text-caption text-mdt-text"
            aria-label="Preview mode"
          >
            <option value="selected">This scope</option>
            <option value="all">All scopes</option>
          </select>
        </label>
      </div>

      <pre className="text-caption bg-mdt-surface-subtle p-3 rounded-mdt-md border border-mdt-border overflow-auto whitespace-pre-wrap font-mono text-mdt-text">
        {markdown}
      </pre>
    </div>
  );
}
