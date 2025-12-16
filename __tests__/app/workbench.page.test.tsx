import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkbenchPage from '@/app/workbench/page';

describe('WorkbenchPage', () => {
  it('renders layout panels', () => {
    render(<WorkbenchPage />);
    expect(screen.getByText('Structure Panel')).toBeInTheDocument();
    expect(screen.getByText('Editor Panel')).toBeInTheDocument();
    expect(screen.getByText('Output Panel')).toBeInTheDocument();
  });

  it('renders tab controls', () => {
    render(<WorkbenchPage />);
    expect(screen.getByRole('button', { name: 'Structure' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editor' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Output' })).toBeInTheDocument();
  });
});
