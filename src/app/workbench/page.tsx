'use client';

import React, { useState, useEffect } from 'react';
import { StructurePanel } from '@/components/workbench/StructurePanel';
import { EditorPanel } from '@/components/workbench/EditorPanel';
import { OutputPanel } from '@/components/workbench/OutputPanel';
import { WorkbenchHeader } from '@/components/workbench/WorkbenchHeader';

export default function WorkbenchPage() {
  const [mobileTab, setMobileTab] = useState<'structure' | 'editor' | 'output'>('structure');
  const [mounted, setMounted] = useState(false);

  // Hydration fix for zustand persist if needed, or just generally to avoid mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null; // or a skeleton

  const tabClass = (tab: typeof mobileTab) => 
    `flex-1 py-3 text-sm font-medium border-b-2 ${
      mobileTab === tab 
        ? 'border-black dark:border-white text-black dark:text-white' 
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-white dark:bg-black">
      <WorkbenchHeader />
      
      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => setMobileTab('structure')} className={tabClass('structure')}>
          Structure
        </button>
        <button onClick={() => setMobileTab('editor')} className={tabClass('editor')}>
          Editor
        </button>
        <button onClick={() => setMobileTab('output')} className={tabClass('output')}>
          Output
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr_320px] overflow-hidden">
        {/* Structure Pane */}
        <div className={`h-full border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 ${mobileTab === 'structure' ? 'block' : 'hidden md:block'}`}>
          <div className="h-full p-4 overflow-hidden">
            <StructurePanel />
          </div>
        </div>

        {/* Editor Pane */}
        <div className={`h-full bg-white dark:bg-black relative ${mobileTab === 'editor' ? 'block' : 'hidden md:block'}`}>
          <div className="h-full p-4 overflow-hidden">
             <EditorPanel />
          </div>
        </div>

        {/* Output Pane */}
        <div className={`h-full border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 ${mobileTab === 'output' ? 'block' : 'hidden md:block'}`}>
           <div className="h-full pt-4 pb-0 px-0 overflow-hidden flex flex-col">
            {/* OutputPanel has its own tabs header which should be at top. 
                If I keep p-4, tabs will be indented. 
                OutputPanel design expects to control the top area.
                I'll remove padding for OutputPanel container or adjust.
            */}
            <OutputPanel />
          </div>
        </div>
      </div>
    </div>
  );
}