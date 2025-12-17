import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WorkbenchPage from '@/app/workbench/page';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn().mockReturnValue({ data: { user: { name: 'Test User' } } }),
}));

// Mock requestAnimationFrame for StructurePanel
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

describe('WorkbenchPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState({}, '', '/workbench');
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('renders layout panels', async () => {
    render(<WorkbenchPage />);
    
    // Structure Panel (starts with loading or Blocks)
    // It renders "Loading structure..." initially.
    expect(screen.getByText('Loading structure...')).toBeInTheDocument();

    // Editor Panel (starts with Select a block...)
    expect(screen.getByText('Select a block to edit')).toBeInTheDocument();

    // Output Panel (starts with Export/Preview tabs)
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('renders tab controls', () => {
    render(<WorkbenchPage />);
    expect(screen.getByRole('button', { name: 'Structure' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editor' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Output' })).toBeInTheDocument();
  });

  it('loads artifact by id from query params', async () => {
    window.history.pushState({}, '', '/workbench?id=a1');

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        artifact: { id: 'a1' },
        latestVersion: {
          uam: { schemaVersion: 1, meta: { title: 'Loaded Title' }, scopes: [], blocks: [] },
        },
      }),
    });

    render(<WorkbenchPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Agent Title')).toHaveValue('Loaded Title');
    });
  });
});
