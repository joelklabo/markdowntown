'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { FileTree } from '@/components/ui/FileTree';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { createZip } from '@/lib/compile/zip';
import { DEFAULT_ADAPTER_VERSION, createUamTargetV1, type UamTargetV1, type UamV1 } from '@/lib/uam/uamTypes';

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
      const blob = await createZip(result.files);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'outputs.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating zip');
    }
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-auto">
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Targets</h3>
        <div className="space-y-2">
          {TARGETS.map((t) => {
            const selected = uam.targets.find((target) => target.targetId === t.targetId) ?? null;
            return (
              <Checkbox key={t.targetId} checked={targetIds.includes(t.targetId)} onChange={() => toggleTarget(t.targetId)}>
              <span className="inline-flex items-center gap-2">
                <span>{t.label}</span>
                {selected ? (
                  <span aria-hidden className="font-mono text-[11px] text-gray-500">
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
          className="mt-2 text-xs text-gray-500 underline underline-offset-4"
          onClick={() => setShowAdvanced((value) => !value)}
        >
          {showAdvanced ? 'Hide advanced' : 'Advanced'}
        </button>

        {showAdvanced && uam.targets.length > 0 ? (
          <div className="mt-3 space-y-3 rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3">
            {uam.targets.map((target) => (
              <div
                key={target.targetId}
                className="space-y-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="font-mono text-xs text-gray-700 dark:text-gray-300">{target.targetId}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500">Adapter</div>
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
                  <div className="text-xs text-gray-500 mb-1">Options (JSON)</div>
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
                    <div className="mt-1 text-xs text-red-500">{optionsErrors[target.targetId]}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex gap-2 items-center flex-wrap">
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
        {error && <div className="text-red-500 text-xs">{error}</div>}
      </div>

      {result && (
        <div className="space-y-3">
          {result.warnings.length > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Warnings</div>
              <ul className="list-disc pl-5 text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {result.info && result.info.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <div className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">Info</div>
              <ul className="list-disc pl-5 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                {result.info.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
              Manifest
            </div>
            <div className="border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900 p-3">
              <FileTree paths={manifestPaths} emptyLabel="No files generated." />
            </div>
          </div>

          {result.files.map((f) => (
            <div key={f.path} className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                <div className="font-mono text-xs text-gray-700 dark:text-gray-300">{f.path}</div>
                <div className="flex items-center gap-2">
                  {copiedPath === f.path && <div className="text-[11px] text-gray-500">Copied</div>}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(f.content);
                        setCopiedPath(f.path);
                        setTimeout(() => setCopiedPath(null), 1000);
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <pre className="text-xs overflow-auto p-3 font-mono whitespace-pre-wrap">{f.content}</pre>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-xs text-gray-500">
          Compiling… (debounced {COMPILE_DEBOUNCE_MS}ms)
        </div>
      )}
    </div>
  );
}
