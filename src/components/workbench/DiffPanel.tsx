'use client';

import React from 'react';
import { DiffViewer } from '@/components/ui/DiffViewer';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';

export function DiffPanel() {
  const uam = useWorkbenchStore((s) => s.uam);
  const baselineUam = useWorkbenchStore((s) => s.baselineUam);

  if (!baselineUam) {
    return <div className="p-mdt-4 text-body-sm text-mdt-muted">No baseline to compare yet.</div>;
  }

  const before = JSON.stringify(baselineUam, null, 2);
  const after = JSON.stringify(uam, null, 2);

  if (before === after) {
    return <div className="p-mdt-4 text-body-sm text-mdt-muted">No changes.</div>;
  }

  return (
    <div className="h-full overflow-auto space-y-mdt-3 p-mdt-4">
      <div className="text-body-sm text-mdt-muted">Comparing current draft to baseline.</div>
      <DiffViewer before={before} after={after} fileName="uam.json" />
    </div>
  );
}
