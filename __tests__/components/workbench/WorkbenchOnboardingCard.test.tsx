import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WorkbenchOnboardingCard } from '@/components/workbench/WorkbenchOnboardingCard';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';
import type { SimulatorToolId } from '@/lib/atlas/simulators/types';

const sampleScanContext = {
  tool: 'github-copilot' as SimulatorToolId,
  cwd: '/repo',
  paths: ['AGENTS.md'],
};

describe('WorkbenchOnboardingCard', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useWorkbenchStore.getState().resetDraft();
      useWorkbenchStore.setState({ scanContext: null });
    });
  });

  it('renders fallback guidance when no scan context is present', () => {
    render(<WorkbenchOnboardingCard />);

    expect(screen.getByText(/no scan context yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /scan a folder/i })).toBeInTheDocument();
    expect(screen.getByText(/scan a folder to prefill workbench/i)).toBeInTheDocument();
  });

  it('renders scan-aware guidance when scan context exists', () => {
    act(() => {
      useWorkbenchStore.setState({ scanContext: sampleScanContext });
    });

    render(<WorkbenchOnboardingCard />);

    expect(screen.getByText(/scan defaults applied/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to scan/i })).toBeInTheDocument();
    expect(screen.getByText(/local-only scan/i)).toBeInTheDocument();
  });

  it('adds a block and selects it', () => {
    render(<WorkbenchOnboardingCard />);

    const before = useWorkbenchStore.getState().blocks.length;
    fireEvent.click(screen.getByRole('button', { name: /add a block/i }));

    const after = useWorkbenchStore.getState().blocks.length;
    expect(after).toBe(before + 1);
    expect(useWorkbenchStore.getState().selectedBlockId).toBeTruthy();
  });
});
