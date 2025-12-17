import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { WorkbenchHeader } from '@/components/workbench/WorkbenchHeader';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import { useSession } from 'next-auth/react';

vi.mock('next-auth/react');

describe('WorkbenchHeader', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useWorkbenchStore.getState().resetDraft();
      useWorkbenchStore.getState().setTitle('Test Agent');
    });
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders title', () => {
    (useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: null });
    render(<WorkbenchHeader />);
    expect(screen.getByDisplayValue('Test Agent')).toBeInTheDocument();
    expect(screen.getByLabelText('Visibility: Draft')).toBeInTheDocument();
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

  it('allows setting visibility and tags', () => {
    (useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: null });
    render(<WorkbenchHeader />);

    fireEvent.change(screen.getByLabelText('Visibility'), { target: { value: 'PUBLIC' } });
    expect(useWorkbenchStore.getState().visibility).toBe('PUBLIC');
    expect(screen.getByLabelText('Visibility: Public')).toBeInTheDocument();

    const tagsInput = screen.getByLabelText('Tags');
    fireEvent.focus(tagsInput);
    fireEvent.change(tagsInput, { target: { value: 'foo, bar' } });
    fireEvent.blur(tagsInput);
    expect(useWorkbenchStore.getState().tags).toEqual(['foo', 'bar']);
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
