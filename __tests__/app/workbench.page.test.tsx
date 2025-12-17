import { beforeEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import WorkbenchPage from '@/app/workbench/page';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';

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
    useWorkbenchStore.getState().resetDraft();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('renders layout panels', async () => {
    const jsx = await WorkbenchPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    
    // Structure Panel (starts with loading or Blocks)
    // It renders "Loading structure..." initially.
    expect(screen.getByText('Loading structure...')).toBeInTheDocument();

    // Editor Panel (starts with Select a block...)
    expect(screen.getByText('Select a block to edit')).toBeInTheDocument();

    // Output Panel (starts with Export/Preview tabs)
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('renders tab controls', async () => {
    const jsx = await WorkbenchPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByRole('button', { name: 'Structure' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editor' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Output' })).toBeInTheDocument();
  });

  it('loads artifact by id from query params', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        artifact: { id: 'a1' },
        latestVersion: {
          uam: { schemaVersion: 1, meta: { title: 'Loaded Title' }, scopes: [], blocks: [] },
        },
      }),
    });

    const jsx = await WorkbenchPage({ searchParams: Promise.resolve({ id: 'a1' }) });
    render(jsx);

    await waitFor(() => {
      expect(screen.getByLabelText('Agent Title')).toHaveValue('Loaded Title');
    });
  });

  it('loads a workbench template from atlas examples', async () => {
    const jsx = await WorkbenchPage({ searchParams: Promise.resolve({ templateId: 'github-copilot/copilot-instructions.md' }) });
    render(jsx);

    await waitFor(() => {
      const title = screen.getByLabelText('Agent Title') as HTMLInputElement;
      expect(title.value).toContain('github-copilot');
    });

    const badge = screen.getByLabelText('Visibility: Draft');
    expect(badge).toBeInTheDocument();

    const copilot = screen.getByLabelText('GitHub Copilot') as HTMLInputElement;
    expect(copilot.checked).toBe(true);
  });

  it('covers add/edit/compile flow', async () => {
    const compileResult = {
      files: [
        {
          path: '.github/instructions/src-ts.instructions.md',
          content: '---\napplyTo: \"src/**/*.ts\"\n---\n\nHello from scope',
        },
      ],
      warnings: [],
      info: [],
    };

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(async (input: unknown) => {
      if (input === '/api/compile') {
        return { ok: true, json: async () => compileResult };
      }
      throw new Error(`Unexpected fetch: ${String(input)}`);
    });

    const jsx = await WorkbenchPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    await waitFor(() => expect(screen.getByText('Scopes')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Add scope' }));
    fireEvent.change(screen.getByLabelText('Scope glob pattern'), { target: { value: 'src/**/*.ts' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => expect(screen.getByText('src/**/*.ts')).toBeInTheDocument());

    fireEvent.click(screen.getByText('+ Add'));

    await waitFor(() => expect(screen.getByLabelText('Block title')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Block title'), { target: { value: 'My Block' } });
    fireEvent.change(screen.getByPlaceholderText(/write markdown instructions/i), {
      target: { value: 'Hello from scope' },
    });

    fireEvent.click(screen.getByLabelText('GitHub Copilot'));
    fireEvent.click(screen.getByRole('button', { name: 'Compile' }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: 'src-ts.instructions.md' })).toBeInTheDocument());
  });
});
