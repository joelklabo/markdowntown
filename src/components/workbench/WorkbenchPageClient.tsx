'use client';

import React, { useEffect, useState } from 'react';
import { TabsList, TabsRoot, TabsTrigger } from '@/components/ui/Tabs';
import { StructurePanel } from '@/components/workbench/StructurePanel';
import { EditorPanel } from '@/components/workbench/EditorPanel';
import { OutputPanel } from '@/components/workbench/OutputPanel';
import { WorkbenchHeader } from '@/components/workbench/WorkbenchHeader';
import type { Session } from 'next-auth';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import type { UamV1 } from '@/lib/uam/uamTypes';

type WorkbenchPageClientProps = {
  initialArtifactId: string | null;
  initialTemplateUam: UamV1 | null;
  session: Session | null;
};

export function WorkbenchPageClient({ initialArtifactId, initialTemplateUam, session }: WorkbenchPageClientProps) {
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
    <div className="flex h-[calc(100vh-64px)] min-h-0 flex-col bg-mdt-bg">
      <WorkbenchHeader session={session} />

      <div className="border-b border-mdt-border bg-mdt-surface px-mdt-4 py-mdt-3 md:hidden">
        <TabsRoot
          value={mobileTab}
          onValueChange={(value) => setMobileTab(value as typeof mobileTab)}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="structure" className="flex-1">Structure</TabsTrigger>
            <TabsTrigger value="editor" className="flex-1">Editor</TabsTrigger>
            <TabsTrigger value="output" className="flex-1">Output</TabsTrigger>
          </TabsList>
        </TabsRoot>
      </div>

      <div className="grid flex-1 min-h-0 grid-cols-1 overflow-hidden md:grid-cols-[280px_minmax(0,1fr)_320px]">
        <div
          className={`h-full border-r border-mdt-border bg-mdt-surface-subtle ${
            mobileTab === 'structure' ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="h-full overflow-hidden p-mdt-4 md:p-mdt-5">
            <StructurePanel />
          </div>
        </div>

        <div className={`relative h-full bg-mdt-surface ${mobileTab === 'editor' ? 'block' : 'hidden md:block'}`}>
          <div className="h-full overflow-hidden p-mdt-4 md:p-mdt-5">
            <EditorPanel />
          </div>
        </div>

        <div
          className={`h-full border-l border-mdt-border bg-mdt-surface-subtle ${
            mobileTab === 'output' ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden p-mdt-4 md:p-mdt-5">
            <OutputPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
