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
        'Confirm scan defaults and targets so we compile the right output.',
        'Add or edit blocks to capture instructions for each scope.',
        'Compile and export your outputs from the right panel.',
      ]
    : [
        'Keep the Global scope or add a folder scope.',
        'Add a block and write the instructions you want to ship.',
        'Add skills to describe reusable capabilities.',
        'Preview and export your agents.md.',
      ];

  const handleAddBlock = () => {
    const id = addBlock({ kind: 'markdown', scopeId: selectedScopeId, body: '' });
    selectBlock(id);
  };

  return (
    <Card className="p-mdt-4 md:p-mdt-5">
      <Stack gap={3}>
        <div className="space-y-mdt-1">
          <Text size="caption" tone="muted">{hasScanContext ? 'Next step' : 'Start here'}</Text>
          <Heading level="h3" as="h2">{hasScanContext ? 'Finish your export' : 'Build an agents.md'}</Heading>
          <Text tone="muted">
            {hasScanContext
              ? 'Your scan defaults are loaded. Add the final details and export the output your tool expects.'
              : 'Add scopes, write instruction blocks, define skills, then export.'}
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
