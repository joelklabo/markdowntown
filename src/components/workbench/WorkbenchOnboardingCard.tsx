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

  const handleAddBlock = () => {
    const id = addBlock({ kind: 'markdown', scopeId: selectedScopeId, body: '' });
    selectBlock(id);
  };

  return (
    <Card className="p-mdt-4 md:p-mdt-5">
      <Stack gap={3}>
        <div className="space-y-mdt-1">
          <Text size="caption" tone="muted">{hasScanContext ? 'Next step' : 'Start here'}</Text>
          <Heading level="h3" as="h2">{hasScanContext ? 'Continue in Workbench' : 'Build an agents.md'}</Heading>
          <Text tone="muted">
            {hasScanContext
              ? 'Your scan defaults are loaded. Add a block, refine the instructions, then export.'
              : 'Add scopes, write instruction blocks, define skills, then export.'}
          </Text>
        </div>

        <ol className="space-y-mdt-2 text-body-sm text-mdt-muted">
          <li className="flex gap-mdt-2">
            <span className="font-semibold text-mdt-text">1.</span>
            <span>
              {hasScanContext
                ? 'Review scan defaults and keep the Global scope or add a folder scope.'
                : 'Keep the Global scope or add a folder scope.'}
            </span>
          </li>
          <li className="flex gap-mdt-2">
            <span className="font-semibold text-mdt-text">2.</span>
            <span>Add a block and write the instructions you want to ship.</span>
          </li>
          <li className="flex gap-mdt-2">
            <span className="font-semibold text-mdt-text">3.</span>
            <span>Add skills to describe reusable capabilities.</span>
          </li>
          <li className="flex gap-mdt-2">
            <span className="font-semibold text-mdt-text">4.</span>
            <span>Preview and export your agents.md.</span>
          </li>
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
