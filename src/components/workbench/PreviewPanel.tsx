'use client';

import React from 'react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';

export function PreviewPanel() {
  const result = useWorkbenchStore(s => s.compilationResult);

  if (!result) {
    return <div className="p-4 text-mdt-muted text-body-sm">No compilation result yet.</div>;
  }

  return (
    <div className="h-full overflow-auto p-4 space-y-6">
      {result.warnings.length > 0 && (
        <div className="p-3 bg-[color:var(--mdt-color-warning)]/10 border border-[color:var(--mdt-color-warning)] rounded-mdt-md">
          <strong className="text-[color:var(--mdt-color-warning)] text-caption block mb-1">Warnings</strong>
          <ul className="list-disc pl-4 text-caption text-[color:var(--mdt-color-warning)]">
            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
      
      {result.files.map(f => (
        <div key={f.path} className="space-y-2">
          <div className="flex items-center justify-between">
             <h4 className="text-body-sm font-bold font-mono text-mdt-text">{f.path}</h4>
          </div>
          <pre className="text-caption bg-mdt-surface-subtle p-3 rounded-mdt-md border border-mdt-border overflow-auto whitespace-pre-wrap font-mono text-mdt-text">
            {f.content}
          </pre>
        </div>
      ))}
    </div>
  );
}
