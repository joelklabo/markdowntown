'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { Button } from '@/components/ui/Button';

export function StructurePanel() {
  const blocks = useWorkbenchStore(s => s.blocks);
  const addBlock = useWorkbenchStore(s => s.addBlock);
  const moveBlock = useWorkbenchStore(s => s.moveBlock);
  const selectBlock = useWorkbenchStore(s => s.selectBlock);
  const selectedBlockId = useWorkbenchStore(s => s.selectedBlockId);
  const removeBlock = useWorkbenchStore(s => s.removeBlock);

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    moveBlock(result.draggableId, result.destination.index);
  };

  const handleAdd = () => {
    const id = crypto.randomUUID();
    addBlock({ id, type: 'instruction', content: '' });
    selectBlock(id);
  };

  if (!enabled) {
    return <div className="p-4 text-mdt-muted text-body-sm">Loading structure...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-body-sm text-mdt-muted uppercase tracking-wider">Blocks</span>
        <Button size="xs" onClick={handleAdd}>+ Add</Button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="blocks-list">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="flex-1 overflow-y-auto space-y-2 pr-2"
            >
              {blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`
                        p-2 rounded border group flex items-center gap-2 cursor-pointer transition-colors
                        ${selectedBlockId === block.id 
                          ? 'border-mdt-primary bg-mdt-primary/10' 
                          : 'border-mdt-border bg-mdt-surface hover:border-mdt-primary-soft'
                        }
                        ${snapshot.isDragging ? 'shadow-lg opacity-80 z-50' : ''}
                      `}
                      onClick={() => selectBlock(block.id)}
                      style={provided.draggableProps.style}
                    >
                      <div {...provided.dragHandleProps} className="text-mdt-muted cursor-grab hover:text-mdt-text px-1">
                        ⋮⋮
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                             <span className="font-mono text-[10px] uppercase text-mdt-muted bg-mdt-surface-strong px-1 rounded">
                               {block.type}
                             </span>
                         </div>
                         <div className="truncate text-caption text-mdt-text font-mono">
                           {block.content || '(empty)'}
                         </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
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
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
