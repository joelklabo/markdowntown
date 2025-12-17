import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ExportPanel } from '@/components/workbench/ExportPanel';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { createUamTargetV1 } from '@/lib/uam/uamTypes';
import { createZip } from '@/lib/compile/zip';

vi.mock('@/lib/compile/zip', () => ({
  createZip: vi.fn().mockResolvedValue(new Blob([])),
}));

global.URL.createObjectURL = vi.fn(() => 'blob:url');
global.URL.revokeObjectURL = vi.fn();

describe('ExportPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useWorkbenchStore.getState().resetDraft();
      useWorkbenchStore.setState({ compilationResult: null });
      const store = useWorkbenchStore.getState();
      store.setUam({ ...store.uam, targets: [createUamTargetV1('agents-md')] });
    });
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('compiles and downloads a zip', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        files: [{ path: 'AGENTS.md', content: '# Hello' }],
        warnings: [],
        info: [],
      }),
    });

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<ExportPanel />);
    fireEvent.click(screen.getByRole('button', { name: /Compile/i }));

    await waitFor(() => {
      expect(screen.getByText('Manifest')).toBeInTheDocument();
      expect(screen.getByText('# Hello')).toBeInTheDocument();
    });

    const download = screen.getByRole('button', { name: /Download zip/i });
    expect(download).toBeEnabled();

    fireEvent.click(download);

    await waitFor(() => {
      expect(createZip).toHaveBeenCalledTimes(1);
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('shows an error when compilation fails', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid payload' }),
    });

    render(<ExportPanel />);
    fireEvent.click(screen.getByRole('button', { name: /Compile/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid payload')).toBeInTheDocument();
    });
  });
});
