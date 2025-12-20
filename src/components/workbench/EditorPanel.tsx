'use client';

import React from 'react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { Input } from '@/components/ui/Input';
import { CodeEditor } from '@/components/ui/CodeEditor';
import type { UamBlockKindV1 } from '@/lib/uam/uamTypes';

export function EditorPanel() {
  const selectedBlockId = useWorkbenchStore(s => s.selectedBlockId);
  const blocks = useWorkbenchStore(s => s.uam.blocks);
  const updateBlock = useWorkbenchStore(s => s.updateBlock);
  const updateBlockBody = useWorkbenchStore(s => s.updateBlockBody);
  const updateBlockTitle = useWorkbenchStore(s => s.updateBlockTitle);

  const block = blocks.find(b => b.id === selectedBlockId);

  if (!block) {
    return (
      <div className="flex h-full items-center justify-center text-body-sm text-mdt-muted">
        Select a block to edit
      </div>
    );
  }

  const helpersByKind: Record<UamBlockKindV1, { placeholder: string; template?: string }> = {
    markdown: { placeholder: 'Write Markdown instructions…' },
    checklist: {
      placeholder: 'Checklist items (Markdown)…',
      template: '- [ ] Add item\n- [ ] Add item\n',
    },
    commands: {
      placeholder: 'Commands to run (Markdown)…',
      template: '```bash\npnpm test\n```\n',
    },
    'dos-donts': {
      placeholder: "Dos and don'ts (Markdown)…",
      template: '## Do\n- \n\n## Don’t\n- \n',
    },
    files: {
      placeholder: 'Files to read/write (Markdown)…',
      template: '- `src/...`\n- `__tests__/...`\n',
    },
  };

  const slashCommands: Array<{ cmd: string; kind: UamBlockKindV1 }> = [
    { cmd: '/checklist', kind: 'checklist' },
    { cmd: '/commands', kind: 'commands' },
    { cmd: '/files', kind: 'files' },
  ];

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    if (val.startsWith('/')) {
      const match = slashCommands.find(s => val === s.cmd || val === `${s.cmd} `);
      if (match) {
        const template = helpersByKind[match.kind].template ?? '';
        updateBlock(block.id, { kind: match.kind });
        updateBlockBody(block.id, template);
        return;
      }
    }

    updateBlockBody(block.id, val);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-mdt-3 flex items-center gap-mdt-2">
        <Input
          value={block.title ?? ''}
          onChange={(e) => updateBlockTitle(block.id, e.target.value || undefined)}
          placeholder="Block title (optional)"
          size="sm"
          aria-label="Block title"
        />
        <span className="text-[11px] text-mdt-muted font-mono whitespace-nowrap">
          {block.kind.toUpperCase()}
        </span>
      </div>

      <CodeEditor
        value={block.body}
        onChange={handleBodyChange}
        className="flex-1 resize-none border-none bg-transparent p-0 focus:ring-0"
        placeholder={helpersByKind[block.kind].placeholder}
        autoFocus
      />

      <div className="mt-mdt-2 text-caption text-mdt-muted">
        Tip: Type <code>/checklist</code>, <code>/commands</code>, <code>/files</code> to switch kind.
      </div>
    </div>
  );
}
