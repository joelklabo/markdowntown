'use client';

import React, { useMemo, useState } from 'react';
import { ExportPanel } from './ExportPanel';
import { PreviewPanel } from './PreviewPanel';
import { LintPanel } from './LintPanel';
import { DiffPanel } from './DiffPanel';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { FileTree } from '@/components/ui/FileTree';

export function OutputPanel() {
  const [tab, setTab] = useState<'preview' | 'export' | 'lint' | 'diff'>('export');
  const result = useWorkbenchStore(s => s.compilationResult);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const filePaths = useMemo(() => (result ? result.files.map(f => f.path) : []), [result]);

  const effectiveSelectedPath = useMemo(() => {
    if (!result || filePaths.length === 0) return null;
    if (selectedPath && filePaths.includes(selectedPath)) return selectedPath;
    return filePaths[0] ?? null;
  }, [result, filePaths, selectedPath]);

  const selectedFile = useMemo(() => {
    if (!result || !effectiveSelectedPath) return null;
    return result.files.find(f => f.path === effectiveSelectedPath) ?? null;
  }, [result, effectiveSelectedPath]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => setTab('export')}
          className={`px-4 py-2 text-sm font-medium ${tab === 'export' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Export
        </button>
        <button 
          onClick={() => setTab('preview')}
          className={`px-4 py-2 text-sm font-medium ${tab === 'preview' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Preview
        </button>
        <button
          onClick={() => setTab('lint')}
          className={`px-4 py-2 text-sm font-medium ${tab === 'lint' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Lint
        </button>
        <button
          onClick={() => setTab('diff')}
          className={`px-4 py-2 text-sm font-medium ${tab === 'diff' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Diff
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {tab === 'export' ? (
          <div className="h-full flex flex-col min-h-0">
            <div className="shrink-0">
              <ExportPanel />
            </div>

            {result && (
              <div className="flex-1 min-h-0 grid grid-cols-[1fr_2fr] border-t border-gray-200 dark:border-gray-800">
                <div className="min-h-0 overflow-auto p-3 border-r border-gray-200 dark:border-gray-800">
                  <FileTree
                    paths={filePaths}
                    selectedPath={effectiveSelectedPath}
                    onSelect={setSelectedPath}
                    emptyLabel="No compiled files yet."
                  />
                </div>
                <div className="min-h-0 overflow-auto p-3">
                  {selectedFile ? (
                    <pre className="text-caption bg-mdt-surface-subtle p-3 rounded-mdt-md border border-mdt-border overflow-auto whitespace-pre-wrap font-mono text-mdt-text">
                      {selectedFile.content}
                    </pre>
                  ) : (
                    <div className="text-mdt-muted text-body-sm">Select a file to view its contents.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : tab === 'preview' ? (
          <PreviewPanel />
        ) : tab === 'lint' ? (
          <LintPanel />
        ) : (
          <DiffPanel />
        )}
      </div>
    </div>
  );
}
