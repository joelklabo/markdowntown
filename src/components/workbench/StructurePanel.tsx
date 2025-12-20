'use client';

import React, { useState, useEffect } from 'react';
import { ScopesPanel } from './ScopesPanel';
import { BlocksPanel } from './BlocksPanel';

export function StructurePanel() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return (
      <div className="rounded-mdt-md border border-mdt-border bg-mdt-surface-subtle px-mdt-4 py-mdt-3 text-body-sm text-mdt-muted">
        Loading structure...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-mdt-4">
      <ScopesPanel />
      <div className="h-px bg-mdt-border" />
      <BlocksPanel />
    </div>
  );
}
