import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';

describe('useWorkbenchStore', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useWorkbenchStore.getState().resetDraft();
    });
    vi.clearAllMocks();
    global.fetch = vi.fn();
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

  it('loads an artifact by id or slug into the store', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        artifact: { id: 'artifact-1' },
        latestVersion: {
          uam: {
            schemaVersion: 1,
            meta: { title: 'Loaded Agent', description: '' },
            scopes: [{ id: 'global', kind: 'global' }],
            blocks: [],
            capabilities: [],
            targets: [],
          },
        },
      }),
    });

    const { result } = renderHook(() => useWorkbenchStore());

    await act(async () => {
      await result.current.loadArtifact('artifact-1');
    });

    expect(result.current.id).toBe('artifact-1');
    expect(result.current.uam.meta.title).toBe('Loaded Agent');
    expect(result.current.compilationResult).toBeNull();
  });

  it('saves a signed-in artifact draft via API', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-id' }),
    });

    const { result } = renderHook(() => useWorkbenchStore());

    await act(async () => {
      const id = await result.current.saveArtifact();
      expect(id).toBe('new-id');
    });

    expect(result.current.id).toBe('new-id');
    expect(result.current.cloudSaveStatus).toBe('saved');
    expect(result.current.cloudLastSavedAt).not.toBeNull();
  });
});
