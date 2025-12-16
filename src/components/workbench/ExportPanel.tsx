'use client';

import React, { useState } from 'react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { createZip } from '@/lib/uam/compile/zip';

export function ExportPanel() {
  const targets = useWorkbenchStore(s => s.targets);
  const toggleTarget = useWorkbenchStore(s => s.toggleTarget);
  const blocks = useWorkbenchStore(s => s.blocks);
  const scopes = useWorkbenchStore(s => s.scopes);
  const setCompilationResult = useWorkbenchStore(s => s.setCompilationResult);
  const result = useWorkbenchStore(s => s.compilationResult);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompile = async () => {
    setLoading(true);
    setError(null);
    try {
      const definition = {
        kind: 'UniversalAgent',
        apiVersion: 'v1',
        metadata: { name: 'Workbench Agent', version: '1.0.0' },
        scopes,
        blocks,
      };

      const res = await fetch('/api/translate/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definition, targets }),
      });

      if (!res.ok) throw new Error('Compilation failed');
      const data = await res.json();
      setCompilationResult(data);
    } catch {
      setError('Error compiling');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    const blob = await createZip(result.files);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Targets</h3>
        <div className="space-y-2">
          <Checkbox checked={targets.includes('agents-md')} onChange={() => toggleTarget('agents-md')}>
            AGENTS.md
          </Checkbox>
          <Checkbox checked={targets.includes('github-copilot')} onChange={() => toggleTarget('github-copilot')}>
            GitHub Copilot
          </Checkbox>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={handleCompile} disabled={loading || targets.length === 0} size="sm">
          {loading ? 'Compiling...' : 'Compile'}
        </Button>
        {result && (
          <Button onClick={handleDownload} variant="secondary" size="sm">
            Download Zip
          </Button>
        )}
      </div>
      
      {error && <div className="text-red-500 text-xs">{error}</div>}
    </div>
  );
}
