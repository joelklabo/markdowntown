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
    return <div className="p-4 text-gray-400 text-sm">Loading structure...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-sm text-gray-500 uppercase tracking-wider">Blocks</span>
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
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-blue-300'
                        }
                        ${snapshot.isDragging ? 'shadow-lg opacity-80 z-50' : ''}
                      `}
                      onClick={() => selectBlock(block.id)}
                      style={provided.draggableProps.style}
                    >
                      <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab hover:text-gray-600 px-1">
                        ⋮⋮
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                             <span className="font-mono text-[10px] uppercase text-gray-500 bg-gray-100 dark:bg-gray-700 px-1 rounded">
                               {block.type}
                             </span>
                         </div>
                         <div className="truncate text-xs text-gray-700 dark:text-gray-300 font-mono">
                           {block.content || '(empty)'}
                         </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1"
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
