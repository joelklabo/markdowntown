import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TranslatePage from '@/app/translate/page';

// Mock createZip which is imported
vi.mock('@/lib/uam/compile/zip', () => ({
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
    expect(screen.getByRole('button', { name: /Translate \/ Compile/i })).toBeInTheDocument();
  });

  it('detects markdown format', () => {
    render(<TranslatePage />);
    const textarea = screen.getByPlaceholderText(/Paste Markdown/i);
    fireEvent.change(textarea, { target: { value: '# Hello' } });
    expect(screen.getByText(/Detected format: Markdown/i)).toBeInTheDocument();
  });

  it('detects UAM format', () => {
    render(<TranslatePage />);
    const textarea = screen.getByPlaceholderText(/Paste Markdown/i);
    const uam = JSON.stringify({ kind: 'UniversalAgent', blocks: [] });
    fireEvent.change(textarea, { target: { value: uam } });
    expect(screen.getByText(/Detected format: UAM \(JSON\)/i)).toBeInTheDocument();
  });

  it('compiles and shows results', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        files: [{ path: 'AGENTS.md', content: '# Hello' }],
        warnings: [],
      }),
    });

    render(<TranslatePage />);
    const textarea = screen.getByPlaceholderText(/Paste Markdown/i);
    fireEvent.change(textarea, { target: { value: '# Hello' } });
    
    const button = screen.getByRole('button', { name: /Translate \/ Compile/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('AGENTS.md')).toBeInTheDocument();
      expect(screen.getByText('# Hello')).toBeInTheDocument();
    });
  });
});
