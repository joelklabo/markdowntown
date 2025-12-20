'use client';

import React, { useEffect, useState } from 'react';
import { TabsList, TabsRoot, TabsTrigger } from '@/components/ui/Tabs';
import { StructurePanel } from '@/components/workbench/StructurePanel';
import { EditorPanel } from '@/components/workbench/EditorPanel';
import { OutputPanel } from '@/components/workbench/OutputPanel';
import { WorkbenchHeader } from '@/components/workbench/WorkbenchHeader';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import type { UamV1 } from '@/lib/uam/uamTypes';

type WorkbenchPageClientProps = {
  initialArtifactId: string | null;
  initialTemplateUam: UamV1 | null;
};

export function WorkbenchPageClient({ initialArtifactId, initialTemplateUam }: WorkbenchPageClientProps) {
  const [mobileTab, setMobileTab] = useState<'structure' | 'editor' | 'output'>('structure');
  const [mounted, setMounted] = useState(false);

  const loadArtifact = useWorkbenchStore(s => s.loadArtifact);
  const initializeFromTemplate = useWorkbenchStore(s => s.initializeFromTemplate);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (initialArtifactId && initialArtifactId.length > 0) {
      void loadArtifact(initialArtifactId);
      return;
    }

    if (initialTemplateUam) {
      initializeFromTemplate(initialTemplateUam);
    }
  }, [initializeFromTemplate, initialArtifactId, initialTemplateUam, loadArtifact, mounted]);

  if (!mounted) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-mdt-bg">
      <WorkbenchHeader />

      <TabsRoot
        value={mobileTab}
        onValueChange={(value) => setMobileTab(value as typeof mobileTab)}
        className="md:hidden"
      >
        <TabsList className="w-full">
          <TabsTrigger value="structure" className="flex-1">Structure</TabsTrigger>
          <TabsTrigger value="editor" className="flex-1">Editor</TabsTrigger>
          <TabsTrigger value="output" className="flex-1">Output</TabsTrigger>
        </TabsList>
      </TabsRoot>

      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[280px_1fr_320px]">
        <div
          className={`h-full border-r border-mdt-border bg-mdt-surface-subtle ${
            mobileTab === 'structure' ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="h-full overflow-hidden p-mdt-4">
            <StructurePanel />
          </div>
        </div>

        <div className={`relative h-full bg-mdt-surface ${mobileTab === 'editor' ? 'block' : 'hidden md:block'}`}>
          <div className="h-full overflow-hidden p-mdt-4">
            <EditorPanel />
          </div>
        </div>

        <div
          className={`h-full border-l border-mdt-border bg-mdt-surface-subtle ${
            mobileTab === 'output' ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden px-0 pb-0 pt-mdt-4">
            <OutputPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
