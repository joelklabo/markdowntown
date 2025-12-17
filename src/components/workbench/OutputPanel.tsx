'use client';

import React, { useState } from 'react';
import { ExportPanel } from './ExportPanel';
import { PreviewPanel } from './PreviewPanel';
import { LintPanel } from './LintPanel';
import { DiffPanel } from './DiffPanel';

export function OutputPanel() {
  const [tab, setTab] = useState<'preview' | 'export' | 'lint' | 'diff'>('export');

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
          <ExportPanel />
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
