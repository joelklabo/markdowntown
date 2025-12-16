import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkbenchPage from '@/app/workbench/page';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn().mockReturnValue({ data: { user: { name: 'Test User' } } }),
}));

// Mock requestAnimationFrame for StructurePanel
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

describe('WorkbenchPage', () => {
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
});