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

  const handleAddBlock = () => {
    const id = addBlock({ kind: 'markdown', scopeId: selectedScopeId, body: '' });
    selectBlock(id);
  };

  return (
    <Card className="p-mdt-4 md:p-mdt-5">
      <Stack gap={3}>
        <div className="space-y-mdt-1">
          <Text size="caption" tone="muted">Quick start</Text>
          <Heading level="h3" as="h2">Build an agents.md</Heading>
          <Text tone="muted">Add scopes, write instruction blocks, then export.</Text>
        </div>

        <ol className="space-y-mdt-2 text-body-sm text-mdt-muted">
          <li className="flex gap-mdt-2">
            <span className="font-semibold text-mdt-text">1.</span>
            <span>Keep the Global scope or add a folder scope.</span>
          </li>
          <li className="flex gap-mdt-2">
            <span className="font-semibold text-mdt-text">2.</span>
            <span>Add a block and write the instructions you want to ship.</span>
          </li>
          <li className="flex gap-mdt-2">
            <span className="font-semibold text-mdt-text">3.</span>
            <span>Preview and export your agents.md.</span>
          </li>
        </ol>

        <div className="flex flex-wrap gap-mdt-2">
          <Button size="sm" onClick={handleAddBlock}>
            Add a block
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link href="/atlas/simulator">Scan a folder</Link>
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
