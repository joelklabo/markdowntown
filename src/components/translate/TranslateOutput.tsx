'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Stack, Row } from '@/components/ui/Stack';
import { TextArea } from '@/components/ui/TextArea';
import { DEFAULT_ADAPTER_VERSION, type UamTargetV1 } from '@/lib/uam/uamTypes';

export interface TranslateCompiledFile {
  path: string;
  content: string;
}

export interface TranslateCompileResult {
  files: TranslateCompiledFile[];
  warnings: string[];
  info: string[];
}

interface TranslateOutputProps {
  targets: UamTargetV1[];
  onToggleTarget: (targetId: string) => void;
  onUpdateTarget: (targetId: string, patch: Partial<Omit<UamTargetV1, 'targetId'>>) => void;
  onCompile: () => void;
  onDownloadZip: () => void;
  loading: boolean;
  error: string | null;
  detectedLabel: string;
  disabledCompile: boolean;
  result: TranslateCompileResult | null;
}

export function TranslateOutput({
  targets,
  onToggleTarget,
  onUpdateTarget,
  onCompile,
  onDownloadZip,
  loading,
  error,
  detectedLabel,
  disabledCompile,
  result,
}: TranslateOutputProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [optionsErrors, setOptionsErrors] = useState<Record<string, string>>({});

  const byId = new Map(targets.map((t) => [t.targetId, t] as const));

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  return (
    <Stack gap={3} className="h-full">
      <Row gap={2} align="center" className="justify-between">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Output</div>
        <div className="text-xs text-gray-500">Detected: {detectedLabel}</div>
      </Row>

      <Stack gap={2}>
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Targets</div>
        <Row gap={4} align="center" className="flex-wrap">
          <Checkbox checked={byId.has('agents-md')} onChange={() => onToggleTarget('agents-md')}>
            <span className="inline-flex items-center gap-2">
              <span>AGENTS.md</span>
              {byId.get('agents-md') ? (
                <span aria-hidden className="font-mono text-[11px] text-gray-500">
                  v{byId.get('agents-md')!.adapterVersion}
                </span>
              ) : null}
            </span>
          </Checkbox>
          <Checkbox checked={byId.has('github-copilot')} onChange={() => onToggleTarget('github-copilot')}>
            <span className="inline-flex items-center gap-2">
              <span>GitHub Copilot</span>
              {byId.get('github-copilot') ? (
                <span aria-hidden className="font-mono text-[11px] text-gray-500">
                  v{byId.get('github-copilot')!.adapterVersion}
                </span>
              ) : null}
            </span>
          </Checkbox>
        </Row>

        <button
          type="button"
          className="text-xs text-gray-500 underline underline-offset-4"
          onClick={() => setShowAdvanced((value) => !value)}
        >
          {showAdvanced ? 'Hide advanced' : 'Advanced'}
        </button>

        {showAdvanced && targets.length > 0 ? (
          <Stack gap={2} className="rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3">
            {targets.map((target) => (
              <Stack key={target.targetId} gap={2} className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-3">
                <Row gap={2} align="center" className="flex-wrap">
                  <div className="font-mono text-xs text-gray-700 dark:text-gray-300">{target.targetId}</div>
                  <Row gap={2} align="center">
                    <div className="text-xs text-gray-500">Adapter</div>
                    <Input
                      size="sm"
                      value={target.adapterVersion}
                      onChange={(e) => {
                        const next = e.target.value.trim();
                        onUpdateTarget(target.targetId, { adapterVersion: next.length > 0 ? next : DEFAULT_ADAPTER_VERSION });
                      }}
                      className="w-20 font-mono"
                      aria-label={`Adapter version for ${target.targetId}`}
                    />
                  </Row>
                </Row>

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
                        onUpdateTarget(target.targetId, { options: parsed });
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
                    <div className="mt-1 text-xs text-red-600">{optionsErrors[target.targetId]}</div>
                  ) : null}
                </div>
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Stack>

      <Row gap={2} align="center">
        <Button onClick={onCompile} disabled={disabledCompile || loading || targets.length === 0} size="sm">
          {loading ? 'Compiling…' : 'Compile'}
        </Button>
        <Button onClick={onDownloadZip} disabled={!result || result.files.length === 0} variant="secondary" size="sm">
          Download zip
        </Button>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </Row>

      {result && (
        <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900">
          <div className="p-3 space-y-3">
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

            {result.info.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <div className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">Info</div>
                <ul className="list-disc pl-5 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  {result.info.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.files.length === 0 && result.warnings.length === 0 && (
              <div className="text-xs text-gray-500 italic">No files generated.</div>
            )}

            {result.files.map((f) => (
              <div key={f.path} className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                  <div className="font-mono text-xs text-gray-700 dark:text-gray-300">{f.path}</div>
                  <Row gap={2} align="center">
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
                  </Row>
                </div>
                <pre className="text-xs overflow-auto p-3 font-mono whitespace-pre-wrap">{f.content}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </Stack>
  );
}
