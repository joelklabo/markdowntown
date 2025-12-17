'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Stack, Row } from '@/components/ui/Stack';

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
  targets: string[];
  onToggleTarget: (targetId: string) => void;
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
  onCompile,
  onDownloadZip,
  loading,
  error,
  detectedLabel,
  disabledCompile,
  result,
}: TranslateOutputProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  return (
    <Stack gap={3} className="h-full">
      <Row gap={2} align="center" className="justify-between">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Output</div>
        <div className="text-xs text-gray-500">Detected: {detectedLabel}</div>
      </Row>

      <Stack gap={2}>
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Targets</div>
        <Row gap={4} align="center" className="flex-wrap">
          <Checkbox checked={targets.includes('agents-md')} onChange={() => onToggleTarget('agents-md')}>
            AGENTS.md
          </Checkbox>
          <Checkbox checked={targets.includes('github-copilot')} onChange={() => onToggleTarget('github-copilot')}>
            GitHub Copilot
          </Checkbox>
        </Row>
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

