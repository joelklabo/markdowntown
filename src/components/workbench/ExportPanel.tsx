'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { FileTree } from '@/components/ui/FileTree';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { createZip } from '@/lib/compile/zip';
import { track } from '@/lib/analytics';
import { DEFAULT_ADAPTER_VERSION, createUamTargetV1, type UamTargetV1, type UamV1 } from '@/lib/uam/uamTypes';
import { emitCityWordmarkEvent } from '@/components/wordmark/sim/bridge';

const COMPILE_DEBOUNCE_MS = 250;

const TARGETS: Array<{ targetId: string; label: string }> = [
  { targetId: 'agents-md', label: 'AGENTS.md' },
  { targetId: 'github-copilot', label: 'GitHub Copilot' },
];

function hasTarget(targets: UamTargetV1[], targetId: string) {
  return targets.some(t => t.targetId === targetId);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function ExportPanel() {
  const uam = useWorkbenchStore(s => s.uam);
  const setUam = useWorkbenchStore(s => s.setUam);
  const result = useWorkbenchStore(s => s.compilationResult);
  const setCompilationResult = useWorkbenchStore(s => s.setCompilationResult);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [optionsErrors, setOptionsErrors] = useState<Record<string, string>>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUamRef = useRef<UamV1 | null>(null);
  const requestIdRef = useRef(0);

  const targetIds = useMemo(() => uam.targets.map(t => t.targetId), [uam.targets]);
  const manifestPaths = useMemo(() => result?.files.map(f => f.path) ?? [], [result]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const compileNow = async (uamToCompile: UamV1) => {
    const requestId = ++requestIdRef.current;

    try {
      setError(null);

      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uam: uamToCompile, targets: uamToCompile.targets }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error ?? `Compilation failed (${res.status})`;
        throw new Error(message);
      }

      const data = await res.json();
      if (requestId !== requestIdRef.current) return;
      setCompilationResult(data);
    } catch (err: unknown) {
      if (requestId !== requestIdRef.current) return;
      setCompilationResult(null);
      setError(err instanceof Error ? err.message : 'Error compiling');
      emitCityWordmarkEvent({ type: 'alert', kind: 'ambulance' });
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const cancelPendingCompile = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = null;
    pendingUamRef.current = null;
    requestIdRef.current++;
    setLoading(false);
  };

  const scheduleCompile = (nextUam: UamV1) => {
    if (nextUam.targets.length === 0) {
      cancelPendingCompile();
      return;
    }

    pendingUamRef.current = nextUam;
    setLoading(true);
    emitCityWordmarkEvent({ type: 'publish', kind: 'artifact' });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const pending = pendingUamRef.current ?? nextUam;
      pendingUamRef.current = null;
      void compileNow(pending);
    }, COMPILE_DEBOUNCE_MS);
  };

  const toggleTarget = (targetId: string) => {
    const nextTargets = hasTarget(uam.targets, targetId)
      ? uam.targets.filter(t => t.targetId !== targetId)
      : [...uam.targets, createUamTargetV1(targetId)];

    const nextUam = { ...uam, targets: nextTargets };
    setUam(nextUam);
  };

  const updateTarget = (targetId: string, patch: Partial<Omit<UamTargetV1, 'targetId'>>) => {
    const nextTargets = uam.targets.map((target) => (target.targetId === targetId ? { ...target, ...patch } : target));
    setUam({ ...uam, targets: nextTargets });
  };

  const handleDownload = async () => {
    if (!result || result.files.length === 0) return;
    try {
      emitCityWordmarkEvent({ type: 'publish', kind: 'file' });
      const blob = await createZip(result.files);
      track('workbench_export_download', {
        targetIds,
        fileCount: result.files.length,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'outputs.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating zip');
      emitCityWordmarkEvent({ type: 'alert', kind: 'ambulance' });
    }
  };

  return (
    <div className="h-full overflow-auto space-y-mdt-4 p-mdt-4">
      <div>
        <h3 className="mb-mdt-2 text-caption font-semibold uppercase tracking-wide text-mdt-muted">Targets</h3>
        <div className="space-y-mdt-2">
          {TARGETS.map((t) => {
            const selected = uam.targets.find((target) => target.targetId === t.targetId) ?? null;
            return (
              <Checkbox key={t.targetId} checked={targetIds.includes(t.targetId)} onChange={() => toggleTarget(t.targetId)}>
              <span className="inline-flex items-center gap-mdt-2">
                <span>{t.label}</span>
                {selected ? (
                  <span aria-hidden className="font-mono text-[11px] text-mdt-muted">
                    v{selected.adapterVersion}
                  </span>
                ) : null}
              </span>
            </Checkbox>
            );
          })}
        </div>

        <button
          type="button"
          className="mt-mdt-2 text-caption text-mdt-muted underline underline-offset-4"
          onClick={() => setShowAdvanced((value) => !value)}
        >
          {showAdvanced ? 'Hide advanced' : 'Advanced'}
        </button>

        {showAdvanced && uam.targets.length > 0 ? (
          <div className="mt-mdt-3 space-y-mdt-3 rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle p-mdt-3">
            {uam.targets.map((target) => (
              <div
                key={target.targetId}
                className="space-y-mdt-2 rounded-mdt-md border border-mdt-border bg-mdt-surface p-mdt-3"
              >
                <div className="flex flex-wrap items-center gap-mdt-3">
                  <div className="font-mono text-caption text-mdt-text">{target.targetId}</div>
                  <div className="flex items-center gap-mdt-2">
                    <div className="text-caption text-mdt-muted">Adapter</div>
                    <Input
                      size="sm"
                      value={target.adapterVersion}
                      onChange={(e) => {
                        const next = e.target.value.trim();
                        updateTarget(target.targetId, { adapterVersion: next.length > 0 ? next : DEFAULT_ADAPTER_VERSION });
                      }}
                      className="w-20 font-mono"
                      aria-label={`Adapter version for ${target.targetId}`}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-mdt-1 text-caption text-mdt-muted">Options (JSON)</div>
                  <TextArea
                    defaultValue={JSON.stringify(target.options ?? {}, null, 2)}
                    rows={4}
                    className="font-mono text-xs"
                    onBlur={(e) => {
                      const text = e.target.value.trim();
                      try {
                        const parsed = text.length === 0 ? {} : JSON.parse(text);
                        if (!isRecord(parsed)) throw new Error('Options must be an object');
                        updateTarget(target.targetId, { options: parsed });
                        setOptionsErrors((prev) => {
                          const next = { ...prev };
                          delete next[target.targetId];
                          return next;
                        });
                      } catch {
                        setOptionsErrors((prev) => ({ ...prev, [target.targetId]: 'Invalid JSON options' }));
                      }
                    }}
                    aria-label={`Options for ${target.targetId}`}
                  />
                  {optionsErrors[target.targetId] ? (
                    <div className="mt-mdt-1 text-caption text-[color:var(--mdt-color-danger)]">
                      {optionsErrors[target.targetId]}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-mdt-2 rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle p-mdt-3">
        <Button onClick={() => scheduleCompile(uam)} disabled={loading || uam.targets.length === 0} size="sm">
          {loading ? 'Compiling…' : 'Compile'}
        </Button>
        <Button
          onClick={handleDownload}
          disabled={!result || result.files.length === 0}
          variant="secondary"
          size="sm"
        >
          Download zip
        </Button>
        {error && <div className="text-caption text-[color:var(--mdt-color-danger)]">{error}</div>}
      </div>

      {result && (
        <div className="space-y-mdt-3">
          {result.warnings.length > 0 && (
            <div className="rounded-mdt-md border border-[color:var(--mdt-color-warning)]/30 bg-[color:var(--mdt-color-warning)]/10 p-mdt-3">
              <div className="mb-mdt-2 text-caption font-semibold text-[color:var(--mdt-color-warning)]">Warnings</div>
              <ul className="list-disc space-y-mdt-1 pl-mdt-5 text-caption text-[color:var(--mdt-color-warning)]">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {result.info && result.info.length > 0 && (
            <div className="rounded-mdt-md border border-[color:var(--mdt-color-info)]/30 bg-[color:var(--mdt-color-info)]/10 p-mdt-3">
              <div className="mb-mdt-2 text-caption font-semibold text-[color:var(--mdt-color-info)]">Info</div>
              <ul className="list-disc space-y-mdt-1 pl-mdt-5 text-caption text-[color:var(--mdt-color-info)]">
                {result.info.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="mb-mdt-2 text-caption font-semibold uppercase tracking-wide text-mdt-muted">
              Manifest
            </div>
            <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle p-mdt-3">
              <FileTree paths={manifestPaths} emptyLabel="No files generated." />
            </div>
          </div>

          {result.files.map((f) => (
            <div key={f.path} className="rounded-mdt-md border border-mdt-border bg-mdt-surface">
              <div className="flex items-center justify-between gap-mdt-2 border-b border-mdt-border px-mdt-3 py-mdt-2">
                <div className="font-mono text-caption text-mdt-text">{f.path}</div>
                <div className="flex items-center gap-mdt-2">
                  {copiedPath === f.path && <div className="text-[11px] text-mdt-muted">Copied</div>}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(f.content);
                        setCopiedPath(f.path);
                        setTimeout(() => setCopiedPath(null), 1000);
                        track('workbench_export_copy', {
                          path: f.path,
                          targetId: uam.targets.length === 1 ? uam.targets[0]?.targetId : undefined,
                        });
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <pre className="p-mdt-3 font-mono text-caption whitespace-pre-wrap overflow-auto">{f.content}</pre>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-caption text-mdt-muted">
          Compiling… (debounced {COMPILE_DEBOUNCE_MS}ms)
        </div>
      )}
    </div>
  );
}
