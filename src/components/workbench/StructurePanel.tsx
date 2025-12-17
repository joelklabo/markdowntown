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
    return <div className="p-4 text-mdt-muted text-body-sm">Loading structure...</div>;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScopesPanel />
      <div className="h-px bg-mdt-border my-4" />
      <BlocksPanel />
    </div>
  );
}
