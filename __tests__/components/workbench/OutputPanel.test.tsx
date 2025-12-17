import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { OutputPanel } from '@/components/workbench/OutputPanel';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';

// Mock createZip which is imported in ExportPanel
vi.mock('@/lib/uam/compile/zip', () => ({
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
        targets: ['agents-md'],
        compilationResult: null,
      });
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
      json: async () => ({ files: [], warnings: [] }),
    });

    render(<OutputPanel />);
    fireEvent.click(screen.getByText('Compile'));
    
    await waitFor(() => {
      expect(screen.getByText('Download Zip')).toBeInTheDocument();
    });
  });
});
