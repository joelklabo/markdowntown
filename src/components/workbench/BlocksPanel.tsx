'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { UamBlockKindV1 } from '@/lib/uam/uamTypes';

const KIND_OPTIONS: Array<{ kind: UamBlockKindV1; label: string }> = [
  { kind: 'markdown', label: 'Markdown' },
  { kind: 'checklist', label: 'Checklist' },
  { kind: 'commands', label: 'Commands' },
  { kind: 'dos-donts', label: "Dos/Don'ts" },
  { kind: 'files', label: 'Files' },
];

function blockPreview(block: { title?: string; body: string }) {
  const title = block.title?.trim();
  if (title && title.length > 0) return title;
  const body = block.body.trim();
  if (body.length === 0) return '(empty)';
  return body.split('\n')[0] ?? '(empty)';
}

export function BlocksPanel() {
  const selectedScopeId = useWorkbenchStore(s => s.selectedScopeId);
  const blocks = useWorkbenchStore(s => s.uam.blocks).filter(b => b.scopeId === selectedScopeId);
  const selectedBlockId = useWorkbenchStore(s => s.selectedBlockId);
  const addBlock = useWorkbenchStore(s => s.addBlock);
  const removeBlock = useWorkbenchStore(s => s.removeBlock);
  const moveBlock = useWorkbenchStore(s => s.moveBlock);
  const selectBlock = useWorkbenchStore(s => s.selectBlock);

  const [kind, setKind] = React.useState<UamBlockKindV1>('markdown');

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    moveBlock(result.draggableId, result.destination.index);
  };

  const handleAdd = () => {
    const id = addBlock({ kind, scopeId: selectedScopeId, body: '' });
    selectBlock(id);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-body-sm text-mdt-muted uppercase tracking-wider">Blocks</span>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="block-kind">
            Block kind
          </label>
          <select
            id="block-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as UamBlockKindV1)}
            className="h-8 rounded-mdt-md border border-mdt-border bg-mdt-surface px-mdt-2 text-caption text-mdt-text"
            aria-label="Block kind"
          >
            {KIND_OPTIONS.map(opt => (
              <option key={opt.kind} value={opt.kind}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button size="xs" onClick={handleAdd}>
            + Add
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`blocks:${selectedScopeId}`}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-2"
            >
              {blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={provided.draggableProps.style}
                      className={cn(
                        'p-2 rounded border group flex items-center gap-2 cursor-pointer transition-colors',
                        selectedBlockId === block.id
                          ? 'border-mdt-primary bg-mdt-primary/10'
                          : 'border-mdt-border bg-mdt-surface hover:border-mdt-primary-soft',
                        snapshot.isDragging ? 'shadow-lg opacity-80 z-50' : ''
                      )}
                      onClick={() => selectBlock(block.id)}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="text-mdt-muted cursor-grab hover:text-mdt-text px-1"
                        aria-label="Drag handle"
                      >
                        ⋮⋮
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] uppercase text-mdt-muted bg-mdt-surface-strong px-1 rounded">
                            {block.kind}
                          </span>
                        </div>
                        <div className="truncate text-caption text-mdt-text font-mono">{blockPreview(block)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBlock(block.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-mdt-muted hover:text-mdt-danger p-1"
                        aria-label="Remove block"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {blocks.length === 0 && (
                <div className="text-mdt-muted text-body-sm">No blocks in this scope.</div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

