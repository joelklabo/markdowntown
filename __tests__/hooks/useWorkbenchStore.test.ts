import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';

describe('useWorkbenchStore', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useWorkbenchStore.getState().resetDraft();
    });
  });

  it('stores UAM v1 as the source of truth', () => {
    const { result } = renderHook(() => useWorkbenchStore());
    
    act(() => {
      result.current.setTitle('My Agent');
      result.current.setDescription('My Description');
    });

    expect(result.current.uam.schemaVersion).toBe(1);
    expect(result.current.uam.meta.title).toBe('My Agent');
    expect(result.current.uam.meta.description).toBe('My Description');
  });

  it('adds scopes and blocks within the selected scope', () => {
    const { result } = renderHook(() => useWorkbenchStore());
    
    let scopeId = '';
    act(() => {
      scopeId = result.current.addScope({ kind: 'glob', name: 'ts', patterns: ['src/**/*.ts'] });
      result.current.selectScope(scopeId);
      result.current.addBlock({ id: 'b1', type: 'instruction', content: 'hello' });
    });

    const block = result.current.uam.blocks.find(b => b.id === 'b1');
    expect(block?.scopeId).toBe(scopeId);
    expect(block?.body).toBe('hello');

    act(() => {
      result.current.updateBlockBody('b1', 'updated');
      result.current.updateBlockTitle('b1', 'Title');
    });

    const updated = result.current.uam.blocks.find(b => b.id === 'b1');
    expect(updated?.body).toBe('updated');
    expect(updated?.title).toBe('Title');
  });

  it('reorders blocks within a scope without moving other scopes', () => {
    const { result } = renderHook(() => useWorkbenchStore());
    let scopeA = '';
    let scopeB = '';

    act(() => {
      scopeA = result.current.addScope({ kind: 'glob', name: 'a', patterns: ['src/**/*.ts'] });
      scopeB = result.current.addScope({ kind: 'dir', name: 'b', dir: 'docs' });

      result.current.selectScope(scopeA);
      result.current.addBlock({ id: 'b1', type: 'instruction', content: 'one' });
      result.current.addBlock({ id: 'b2', type: 'instruction', content: 'two' });

      result.current.selectScope(scopeB);
      result.current.addBlock({ id: 'b3', type: 'instruction', content: 'three' });
    });

    expect(result.current.blocks.map(b => b.id)).toEqual(['b1', 'b2', 'b3']);

    act(() => {
      result.current.moveBlock('b2', 0);
    });

    expect(result.current.blocks.map(b => b.id)).toEqual(['b2', 'b1', 'b3']);

    act(() => {
      result.current.removeScope(scopeA);
    });

    expect(result.current.blocks.map(b => b.id)).toEqual(['b3']);
    expect(result.current.uam.blocks.map(b => b.id)).toEqual(['b3']);
  });
});
