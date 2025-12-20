import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { WorkbenchHeader } from '@/components/workbench/WorkbenchHeader';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import type { Session } from 'next-auth';

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
    render(<WorkbenchHeader session={null} />);
    expect(screen.getByDisplayValue('Test Agent')).toBeInTheDocument();
    expect(screen.getByLabelText('Visibility: Draft')).toBeInTheDocument();
  });

  it('shows sign in warning if logged out', () => {
    render(<WorkbenchHeader session={null} />);
    expect(screen.getByText('Sign in to save')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeDisabled();
  });

  it('enables save if logged in', () => {
    const session = { user: { name: 'User' } } as Session;
    render(<WorkbenchHeader session={session} />);
    expect(screen.getByText('Save')).not.toBeDisabled();
  });

  it('allows setting visibility and tags', () => {
    render(<WorkbenchHeader session={null} />);

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
    const session = { user: { name: 'User' } } as Session;
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-id' }),
    });

    render(<WorkbenchHeader session={session} />);
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(useWorkbenchStore.getState().id).toBe('new-id');
    });
  });
});
