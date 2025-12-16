import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    useWorkbenchStore.setState({
      blocks: [],
      targets: ['agents-md'],
      compilationResult: null,
    });
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders tabs and export panel by default', () => {
    render(<OutputPanel />);
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Targets')).toBeInTheDocument(); // Export panel content
  });

  it('switches tabs', () => {
    render(<OutputPanel />);
    fireEvent.click(screen.getByText('Preview'));
    expect(screen.getByText('No compilation result yet.')).toBeInTheDocument(); // Preview panel content
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
