'use client';

import React, { useState } from 'react';
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '@/components/ui/Tabs';
import { ExportPanel } from './ExportPanel';
import { PreviewPanel } from './PreviewPanel';
import { LintPanel } from './LintPanel';
import { DiffPanel } from './DiffPanel';

export function OutputPanel() {
  const [tab, setTab] = useState<'preview' | 'export' | 'lint' | 'diff'>('export');

  return (
    <TabsRoot value={tab} onValueChange={(value) => setTab(value as typeof tab)} className="flex h-full flex-col gap-mdt-4">
      <TabsList className="w-full">
        <TabsTrigger value="export">Export</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="lint">Lint</TabsTrigger>
        <TabsTrigger value="diff">Diff</TabsTrigger>
      </TabsList>

      <div className="relative flex-1 overflow-hidden">
        <TabsContent value="export" className="!mt-0 h-full border-none bg-transparent p-0 shadow-none">
          <ExportPanel />
        </TabsContent>
        <TabsContent value="preview" className="!mt-0 h-full border-none bg-transparent p-0 shadow-none">
          <PreviewPanel />
        </TabsContent>
        <TabsContent value="lint" className="!mt-0 h-full border-none bg-transparent p-0 shadow-none">
          <LintPanel />
        </TabsContent>
        <TabsContent value="diff" className="!mt-0 h-full border-none bg-transparent p-0 shadow-none">
          <DiffPanel />
        </TabsContent>
      </div>
    </TabsRoot>
  );
}
