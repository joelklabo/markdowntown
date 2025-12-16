import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkbenchHeader } from '@/components/workbench/WorkbenchHeader';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { useSession } from 'next-auth/react';

vi.mock('next-auth/react');

describe('WorkbenchHeader', () => {
  beforeEach(() => {
    useWorkbenchStore.setState({
      title: 'Test Agent',
      id: undefined,
    });
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders title', () => {
    (useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: null });
    render(<WorkbenchHeader />);
    expect(screen.getByDisplayValue('Test Agent')).toBeInTheDocument();
  });

  it('shows sign in warning if logged out', () => {
    (useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: null });
    render(<WorkbenchHeader />);
    expect(screen.getByText('Sign in to save')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeDisabled();
  });

  it('enables save if logged in', () => {
    (useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: { user: { name: 'User' } } });
    render(<WorkbenchHeader />);
    expect(screen.getByText('Save')).not.toBeDisabled();
  });

  it('saves artifact', async () => {
    (useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: { user: { name: 'User' } } });
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-id' }),
    });

    render(<WorkbenchHeader />);
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(useWorkbenchStore.getState().id).toBe('new-id');
    });
  });
});
