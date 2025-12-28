'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Heading } from '@/components/ui/Heading';
import { Stack } from '@/components/ui/Stack';
import { Text } from '@/components/ui/Text';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';

export function WorkbenchOnboardingCard() {
  const selectedScopeId = useWorkbenchStore(s => s.selectedScopeId);
  const addBlock = useWorkbenchStore(s => s.addBlock);
  const selectBlock = useWorkbenchStore(s => s.selectBlock);
  const scanContext = useWorkbenchStore(s => s.scanContext);
  const hasScanContext = Boolean(scanContext);
  const steps = hasScanContext
    ? [
        'Review scan defaults and confirm targets.',
        'Add a scope or block to finalize instructions.',
        'Export agents.md when ready.',
      ]
    : [
        'Scan a folder to prefill Workbench.',
        'Add a scope or block to start building.',
        'Export agents.md when ready.',
      ];

  const handleAddBlock = () => {
    const id = addBlock({ kind: 'markdown', scopeId: selectedScopeId, body: '' });
    selectBlock(id);
  };

  return (
    <Card className="p-mdt-4 md:p-mdt-5">
      <Stack gap={3}>
        <div className="space-y-mdt-1">
          <Text size="caption" tone="muted">{hasScanContext ? 'Scan defaults applied' : 'No scan context yet'}</Text>
          <Heading level="h3" as="h2">Build your agents.md</Heading>
          <Text tone="muted">
            {hasScanContext
              ? 'Local-only scan. Add scopes or blocks, then export when ready.'
              : 'Scan a folder to see what loads, then build and export.'}
          </Text>
        </div>

        <ol className="space-y-mdt-2 text-body-sm text-mdt-muted">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-mdt-2">
              <span className="font-semibold text-mdt-text">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-mdt-2">
          <Button size="sm" onClick={handleAddBlock}>
            Add a block
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link href="/atlas/simulator">{hasScanContext ? 'Back to Scan' : 'Scan a folder'}</Link>
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
