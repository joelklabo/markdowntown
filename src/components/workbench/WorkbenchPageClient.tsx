'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TabsList, TabsRoot, TabsTrigger } from '@/components/ui/Tabs';
import { StructurePanel } from '@/components/workbench/StructurePanel';
import { EditorPanel } from '@/components/workbench/EditorPanel';
import { OutputPanel } from '@/components/workbench/OutputPanel';
import { WorkbenchHeader } from '@/components/workbench/WorkbenchHeader';
import { WorkbenchOnboardingCard } from '@/components/workbench/WorkbenchOnboardingCard';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import type { Session } from 'next-auth';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import type { SimulatorToolId } from '@/lib/atlas/simulators/types';
import type { UamV1 } from '@/lib/uam/uamTypes';

type ScanContext = {
  tool: SimulatorToolId;
  cwd: string;
  paths: string[];
};

type WorkbenchPageClientProps = {
  initialArtifactId: string | null;
  initialTemplateUam: UamV1 | null;
  initialScanContext: ScanContext | null;
  session: Session | null;
};

const TOOL_LABELS: Record<SimulatorToolId, string> = {
  'github-copilot': 'GitHub Copilot',
  'copilot-cli': 'Copilot CLI',
  'claude-code': 'Claude Code',
  'gemini-cli': 'Gemini CLI',
  'codex-cli': 'Codex CLI',
};

export function WorkbenchPageClient({
  initialArtifactId,
  initialTemplateUam,
  initialScanContext,
  session,
}: WorkbenchPageClientProps) {
  const [mobileTab, setMobileTab] = useState<'structure' | 'editor' | 'output'>('structure');
  const [mounted, setMounted] = useState(false);
  const appliedScanRef = useRef(false);

  const loadArtifact = useWorkbenchStore(s => s.loadArtifact);
  const initializeFromTemplate = useWorkbenchStore(s => s.initializeFromTemplate);
  const applyScanContext = useWorkbenchStore(s => s.applyScanContext);
  const clearScanContext = useWorkbenchStore(s => s.clearScanContext);
  const scanContext = useWorkbenchStore(s => s.scanContext);
  const hasBlocks = useWorkbenchStore(s => s.uam.blocks.length > 0);

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

  useEffect(() => {
    if (!mounted) return;
    if (appliedScanRef.current) return;
    if (!initialScanContext) return;
    if (initialArtifactId || initialTemplateUam) return;
    applyScanContext(initialScanContext);
    appliedScanRef.current = true;
  }, [applyScanContext, initialArtifactId, initialScanContext, initialTemplateUam, mounted]);

  const scanSummary = useMemo(() => {
    if (!scanContext) return null;
    const toolLabel = TOOL_LABELS[scanContext.tool] ?? scanContext.tool;
    const cwdLabel = scanContext.cwd ? scanContext.cwd : '(repo root)';
    const fileCount = scanContext.paths.length;
    const preview = scanContext.paths.slice(0, 3);
    const previewLabel =
      preview.length > 0
        ? `${preview.join(', ')}${fileCount > preview.length ? ` +${fileCount - preview.length} more` : ''}`
        : 'No instruction files detected.';

    return {
      toolLabel,
      cwdLabel,
      fileCount,
      previewLabel,
    };
  }, [scanContext]);

  const handleClearScan = () => {
    clearScanContext();
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('scanTool');
      url.searchParams.delete('scanCwd');
      url.searchParams.delete('scanPaths');
      window.history.replaceState({}, '', `${url.pathname}${url.search}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] min-h-0 flex-col bg-mdt-bg">
      <WorkbenchHeader session={session} />

      {scanSummary ? (
        <div className="border-b border-mdt-border bg-mdt-surface-subtle px-mdt-4 py-mdt-3">
          <div className="flex flex-wrap items-start justify-between gap-mdt-3">
            <div className="space-y-mdt-1">
              <Text size="caption" tone="muted">
                Scan defaults applied
              </Text>
              <Text weight="semibold">
                {scanSummary.toolLabel} · cwd {scanSummary.cwdLabel}
              </Text>
              <Text size="bodySm" tone="muted">
                {scanSummary.previewLabel}
              </Text>
            </div>
            <div className="flex flex-wrap items-center gap-mdt-2">
              <Button size="sm" variant="secondary" onClick={handleClearScan}>
                Clear scan defaults
              </Button>
            </div>
          </div>
        </div>
      ) : null}

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
            <div className="flex h-full flex-col gap-mdt-4">
              {!hasBlocks && <WorkbenchOnboardingCard />}
              <div className="flex-1 min-h-0">
                <EditorPanel />
              </div>
            </div>
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
