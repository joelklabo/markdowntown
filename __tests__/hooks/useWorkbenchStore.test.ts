import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';

describe('useWorkbenchStore', () => {
  beforeEach(() => {
    // Reset store
    localStorage.clear();
    useWorkbenchStore.setState({
      blocks: [],
      scopes: ['root'],
      selectedScope: 'root',
      selectedBlockId: null,
      targets: [],
      compilationResult: null,
      autosaveStatus: 'idle',
    }); // merge
  });

  it('adds a block', () => {
    const { result } = renderHook(() => useWorkbenchStore());
    
    act(() => {
      result.current.addBlock({ id: 'b1', type: 'instruction', content: 'test' });
    });

    expect(result.current.blocks).toHaveLength(1);
    expect(result.current.blocks[0].content).toBe('test');
  });

  it('updates a block', () => {
    const { result } = renderHook(() => useWorkbenchStore());
    
    act(() => {
      result.current.addBlock({ id: 'b1', type: 'instruction', content: 'test' });
      result.current.updateBlock('b1', { content: 'updated' });
    });

    expect(result.current.blocks[0].content).toBe('updated');
  });

  it('removes a block', () => {
    const { result } = renderHook(() => useWorkbenchStore());
    
    act(() => {
      result.current.addBlock({ id: 'b1', type: 'instruction', content: 'test' });
      result.current.removeBlock('b1');
    });

    expect(result.current.blocks).toHaveLength(0);
  });
});
