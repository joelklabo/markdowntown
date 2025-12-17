'use client';

import React from 'react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import { UamScopeV1Schema } from '@/lib/uam/uamValidate';

function scopeLabel(scope: { kind: string; name?: string; patterns?: string[]; dir?: string }) {
  if (scope.name && scope.name.trim().length > 0) return scope.name;
  if (scope.kind === 'global') return 'Global';
  if (scope.kind === 'dir') return scope.dir ?? 'Directory';
  return (scope.patterns ?? []).join(', ') || 'Glob';
}

export function ScopesPanel() {
  const scopes = useWorkbenchStore(s => s.uam.scopes);
  const blocks = useWorkbenchStore(s => s.uam.blocks);
  const selectedScopeId = useWorkbenchStore(s => s.selectedScopeId);
  const addScope = useWorkbenchStore(s => s.addScope);
  const removeScope = useWorkbenchStore(s => s.removeScope);
  const selectScope = useWorkbenchStore(s => s.selectScope);
  const selectBlock = useWorkbenchStore(s => s.selectBlock);

  const [adding, setAdding] = React.useState(false);
  const [pattern, setPattern] = React.useState('');

  const trimmed = pattern.trim();

  const validation = React.useMemo(() => {
    if (!adding) return { ok: true, message: null as string | null };
    if (trimmed.length === 0) return { ok: false, message: 'Enter a glob pattern.' };

    const duplicate = scopes.some(s => s.kind === 'glob' && (s as { patterns: string[] }).patterns.includes(trimmed));
    if (duplicate) return { ok: false, message: 'That scope already exists.' };

    const result = UamScopeV1Schema.safeParse({ id: 'temp', kind: 'glob', patterns: [trimmed] });
    if (!result.success) return { ok: false, message: result.error.issues[0]?.message ?? 'Invalid glob pattern.' };

    return { ok: true, message: null as string | null };
  }, [adding, trimmed, scopes]);

  const handleSelect = (scopeId: string) => {
    selectScope(scopeId);
    selectBlock(null);
  };

  const handleAdd = () => {
    if (!validation.ok) return;
    const id = addScope({ kind: 'glob', patterns: [trimmed] });
    setPattern('');
    setAdding(false);
    handleSelect(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-body-sm text-mdt-muted uppercase tracking-wider">Scopes</span>
        <Button
          size="xs"
          variant="secondary"
          onClick={() => setAdding(v => !v)}
          aria-label={adding ? 'Cancel add scope' : 'Add scope'}
        >
          {adding ? 'Cancel' : '+ Scope'}
        </Button>
      </div>

      {adding && (
        <div className="mb-3 space-y-2">
          <Input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="src/**/*.ts"
            aria-label="Scope glob pattern"
            className="h-8"
          />
          {validation.message && <div className="text-caption text-mdt-danger">{validation.message}</div>}
          <div className="flex justify-end">
            <Button size="xs" onClick={handleAdd} disabled={!validation.ok}>
              Add
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {scopes.map(scope => {
          const count = blocks.filter(b => b.scopeId === scope.id).length;
          const selected = selectedScopeId === scope.id;
          const removable = scope.kind !== 'global';

          return (
            <div
              key={scope.id}
              className={cn(
                'w-full text-left px-2 py-2 rounded border flex items-center gap-2 transition-colors',
                selected ? 'border-mdt-primary bg-mdt-primary/10' : 'border-mdt-border bg-mdt-surface hover:border-mdt-primary-soft'
              )}
            >
              <button
                type="button"
                onClick={() => handleSelect(scope.id)}
                className="flex-1 min-w-0 text-left"
                aria-current={selected ? 'true' : undefined}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate text-body-sm text-mdt-text">{scopeLabel(scope)}</span>
                  <span className="text-[10px] text-mdt-muted font-mono uppercase">
                    {scope.kind}
                  </span>
                </div>
                <div className="text-caption text-mdt-muted">{count} blocks</div>
              </button>

              {removable && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeScope(scope.id);
                  }}
                  className="text-mdt-muted hover:text-mdt-danger px-1"
                  aria-label="Remove scope"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
