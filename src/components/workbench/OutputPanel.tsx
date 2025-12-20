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
    <TabsRoot value={tab} onValueChange={(value) => setTab(value as typeof tab)} className="flex flex-col h-full">
      <TabsList className="w-full">
        <TabsTrigger value="export">Export</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="lint">Lint</TabsTrigger>
        <TabsTrigger value="diff">Diff</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden relative">
        <TabsContent value="export" className="!mt-mdt-3 border-none bg-transparent p-0 shadow-none h-full">
          <ExportPanel />
        </TabsContent>
        <TabsContent value="preview" className="!mt-mdt-3 border-none bg-transparent p-0 shadow-none h-full">
          <PreviewPanel />
        </TabsContent>
        <TabsContent value="lint" className="!mt-mdt-3 border-none bg-transparent p-0 shadow-none h-full">
          <LintPanel />
        </TabsContent>
        <TabsContent value="diff" className="!mt-mdt-3 border-none bg-transparent p-0 shadow-none h-full">
          <DiffPanel />
        </TabsContent>
      </div>
    </TabsRoot>
  );
}
