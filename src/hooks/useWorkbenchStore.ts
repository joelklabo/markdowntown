import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UAMBlock, UAMScope } from '@/lib/uam/types';
import { CompilationResult } from '@/lib/uam/adapters';

interface WorkbenchState {
  id?: string;
  title: string;
  description: string;
  blocks: UAMBlock[];
  scopes: UAMScope[];
  selectedScope: string | null;
  selectedBlockId: string | null;
  targets: string[];
  compilationResult: CompilationResult | null;
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  
  // Actions
  setId: (id?: string) => void;
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  addBlock: (block: UAMBlock) => void;
  updateBlock: (id: string, updates: Partial<UAMBlock>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, newIndex: number) => void;
  
  addScope: (scope: UAMScope) => void;
  removeScope: (scope: UAMScope) => void;
  selectScope: (scope: string | null) => void;
  
  selectBlock: (id: string | null) => void;
  
  toggleTarget: (target: string) => void;
  setCompilationResult: (result: CompilationResult | null) => void;
  setAutosaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
}

export const useWorkbenchStore = create<WorkbenchState>()(
  persist(
    (set) => ({
      id: undefined,
      title: 'Untitled Agent',
      description: '',
      blocks: [],
      scopes: ['root'],
      selectedScope: 'root',
      selectedBlockId: null,
      targets: [],
      compilationResult: null,
      autosaveStatus: 'idle',

      setId: (id) => set({ id }),
      setTitle: (title) => set({ title }),
      setDescription: (description) => set({ description }),

      addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
      updateBlock: (id, updates) => set((state) => ({
        blocks: state.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
      })),
      removeBlock: (id) => set((state) => ({
        blocks: state.blocks.filter(b => b.id !== id)
      })),
      moveBlock: (id, newIndex) => set((state) => {
        const blocks = [...state.blocks];
        const index = blocks.findIndex(b => b.id === id);
        if (index === -1) return {};
        const [moved] = blocks.splice(index, 1);
        blocks.splice(newIndex, 0, moved);
        return { blocks };
      }),

      addScope: (scope) => set((state) => ({ 
        scopes: state.scopes.includes(scope) ? state.scopes : [...state.scopes, scope] 
      })),
      removeScope: (scope) => set((state) => ({
        scopes: state.scopes.filter(s => s !== scope),
        selectedScope: state.selectedScope === scope ? 'root' : state.selectedScope
      })),
      selectScope: (scope) => set({ selectedScope: scope }),

      selectBlock: (id) => set({ selectedBlockId: id }),

      toggleTarget: (target) => set((state) => ({
        targets: state.targets.includes(target) 
          ? state.targets.filter(t => t !== target) 
          : [...state.targets, target]
      })),
      setCompilationResult: (result) => set({ compilationResult: result }),
      setAutosaveStatus: (status) => set({ autosaveStatus: status }),
    }),
    {
      name: 'workbench-storage',
    }
  )
);
