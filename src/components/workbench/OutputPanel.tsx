'use client';

import React, { useState } from 'react';
import { ExportPanel } from './ExportPanel';
import { PreviewPanel } from './PreviewPanel';

export function OutputPanel() {
  const [tab, setTab] = useState<'preview' | 'export'>('export');

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
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {tab === 'export' ? <ExportPanel /> : <PreviewPanel />}
      </div>
    </div>
  );
}
