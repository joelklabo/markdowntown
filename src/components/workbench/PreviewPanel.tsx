'use client';

import React from 'react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';

export function PreviewPanel() {
  const result = useWorkbenchStore(s => s.compilationResult);

  if (!result) {
    return <div className="p-4 text-gray-400 text-sm">No compilation result yet.</div>;
  }

  return (
    <div className="h-full overflow-auto p-4 space-y-6">
      {result.warnings.length > 0 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <strong className="text-yellow-800 dark:text-yellow-200 text-xs block mb-1">Warnings</strong>
          <ul className="list-disc pl-4 text-xs text-yellow-700 dark:text-yellow-300">
            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      
      {result.files.map(f => (
        <div key={f.path} className="space-y-2">
          <div className="flex items-center justify-between">
             <h4 className="text-sm font-bold font-mono text-gray-700 dark:text-gray-300">{f.path}</h4>
          </div>
          <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-800 overflow-auto whitespace-pre-wrap font-mono">
            {f.content}
          </pre>
        </div>
      ))}
    </div>
  );
}
