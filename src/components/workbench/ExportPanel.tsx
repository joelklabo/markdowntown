'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { FileTree } from '@/components/ui/FileTree';
import { createZip } from '@/lib/compile/zip';
import { createUamTargetV1, type UamTargetV1, type UamV1 } from '@/lib/uam/uamTypes';

const COMPILE_DEBOUNCE_MS = 250;

const TARGETS: Array<{ targetId: string; label: string }> = [
  { targetId: 'agents-md', label: 'AGENTS.md' },
  { targetId: 'github-copilot', label: 'GitHub Copilot' },
];

function hasTarget(targets: UamTargetV1[], targetId: string) {
  return targets.some(t => t.targetId === targetId);
}

export function ExportPanel() {
  const uam = useWorkbenchStore(s => s.uam);
  const setUam = useWorkbenchStore(s => s.setUam);
  const result = useWorkbenchStore(s => s.compilationResult);
  const setCompilationResult = useWorkbenchStore(s => s.setCompilationResult);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

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
          {TARGETS.map(t => (
            <Checkbox key={t.targetId} checked={targetIds.includes(t.targetId)} onChange={() => toggleTarget(t.targetId)}>
              {t.label}
            </Checkbox>
          ))}
        </div>
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

