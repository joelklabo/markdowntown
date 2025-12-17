import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TranslatePage from '@/app/translate/page';

// Mock createZip which is imported
vi.mock('@/lib/compile/zip', () => ({
  createZip: vi.fn().mockResolvedValue(new Blob([])),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:url');
global.URL.revokeObjectURL = vi.fn();

describe('TranslatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders input and output sections', () => {
    render(<TranslatePage />);
    expect(screen.getByText('Input')).toBeInTheDocument();
    expect(screen.getByText('Output')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compile/i })).toBeInTheDocument();
  });

  it('detects markdown format', () => {
    render(<TranslatePage />);
    const textarea = screen.getByPlaceholderText(/Paste Markdown/i);
    fireEvent.change(textarea, { target: { value: '# Hello' } });
    expect(screen.getByText(/Detected: Markdown/i)).toBeInTheDocument();
  });

  it('detects UAM v1 (JSON) format', () => {
    render(<TranslatePage />);
    const textarea = screen.getByPlaceholderText(/Paste Markdown/i);
    const uam = JSON.stringify({ schemaVersion: 1, meta: { title: 'Test' }, scopes: [], blocks: [] });
    fireEvent.change(textarea, { target: { value: uam } });
    expect(screen.getByText(/Detected: UAM v1 \(JSON\)/i)).toBeInTheDocument();
  });

  it('compiles and shows results', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        files: [{ path: 'AGENTS.md', content: '# Hello' }],
        warnings: [],
        info: [],
      }),
    });

    render(<TranslatePage />);
    const textarea = screen.getByPlaceholderText(/Paste Markdown/i);
    fireEvent.change(textarea, { target: { value: '# Hello' } });
    
    const button = screen.getByRole('button', { name: /Compile/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('AGENTS.md')).toBeInTheDocument();
      expect(screen.getByText('# Hello')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/compile',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
