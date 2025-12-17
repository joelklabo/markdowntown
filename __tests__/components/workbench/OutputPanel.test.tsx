import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { OutputPanel } from '@/components/workbench/OutputPanel';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { createUamTargetV1 } from '@/lib/uam/uamTypes';

// Mock createZip which is imported in ExportPanel
vi.mock('@/lib/compile/zip', () => ({
  createZip: vi.fn().mockResolvedValue(new Blob([])),
}));

// Mock URL
global.URL.createObjectURL = vi.fn(() => 'blob:url');
global.URL.revokeObjectURL = vi.fn();

describe('OutputPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useWorkbenchStore.getState().resetDraft();
      useWorkbenchStore.setState({
        compilationResult: null,
      });
      const store = useWorkbenchStore.getState();
      store.setUam({ ...store.uam, targets: [createUamTargetV1('agents-md')] });
    });
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders tabs and export panel by default', () => {
    render(<OutputPanel />);
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Lint')).toBeInTheDocument();
    expect(screen.getByText('Diff')).toBeInTheDocument();
    expect(screen.getByText('Targets')).toBeInTheDocument(); // Export panel content
  });

  it('switches tabs', () => {
    render(<OutputPanel />);
    fireEvent.click(screen.getByText('Preview'));
    expect(screen.getByText(/# Untitled Agent/)).toBeInTheDocument(); // Preview panel content
  });

  it('triggers compile', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ files: [{ path: 'AGENTS.md', content: 'hello' }], warnings: [], info: [] }),
    });

    render(<OutputPanel />);
    fireEvent.click(screen.getByText('Compile'));
    
    await waitFor(() => {
      expect(screen.getByText('Manifest')).toBeInTheDocument();
      expect(screen.getByText('hello')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Download zip' })).toBeEnabled();
  });
});
