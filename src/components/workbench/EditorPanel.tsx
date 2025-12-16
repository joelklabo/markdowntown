'use client';

import React from 'react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { TextArea } from '@/components/ui/TextArea';
import { UAMBlockType } from '@/lib/uam/types';

const BLOCK_TYPES: UAMBlockType[] = ['instruction', 'prompt', 'code', 'context'];

export function EditorPanel() {
  const selectedBlockId = useWorkbenchStore(s => s.selectedBlockId);
  const blocks = useWorkbenchStore(s => s.blocks);
  const updateBlock = useWorkbenchStore(s => s.updateBlock);

  const block = blocks.find(b => b.id === selectedBlockId);

  if (!block) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        Select a block to edit
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    
    // Simple slash command: if content starts with /type, switch type
    // Only if it was empty or we are typing at start?
    // Let's do it if the whole content matches the pattern to avoid accidental triggers
    if (val.startsWith('/')) {
        const match = BLOCK_TYPES.find(t => val === `/${t} ` || val === `/${t}`);
        if (match) {
            updateBlock(block.id, { type: match, content: '' }); // Clear content after switch
            return;
        }
    }
    
    updateBlock(block.id, { content: val });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateBlock(block.id, { type: e.target.value as UAMBlockType });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
        <select 
          value={block.type} 
          onChange={handleTypeChange}
          className="text-sm border-none bg-transparent font-bold uppercase text-gray-500 focus:ring-0 cursor-pointer hover:text-black dark:hover:text-white"
        >
          {BLOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="text-xs text-gray-300 font-mono ml-auto">ID: {block.id.slice(0, 8)}</span>
      </div>
      
      <TextArea
        value={block.content}
        onChange={handleChange}
        className="flex-1 font-mono text-sm resize-none border-none focus:ring-0 p-0 bg-transparent"
        placeholder={`Type content for ${block.type}... (supports Markdown)`}
        autoFocus
      />
      
      <div className="mt-2 text-xs text-gray-300">
        Tip: Type <code>/code</code>, <code>/prompt</code> to switch type.
      </div>
    </div>
  );
}
