import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorPanel } from '@/components/workbench/EditorPanel';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';

describe('EditorPanel', () => {
  beforeEach(() => {
    useWorkbenchStore.setState({
      blocks: [{ id: 'b1', type: 'instruction', content: 'Initial' }],
      selectedBlockId: 'b1',
    });
  });

  it('renders editor with block content', () => {
    render(<EditorPanel />);
    expect(screen.getByDisplayValue('Initial')).toBeInTheDocument();
  });

  it('updates content', () => {
    render(<EditorPanel />);
    const textarea = screen.getByDisplayValue('Initial');
    fireEvent.change(textarea, { target: { value: 'Updated' } });
    
    expect(useWorkbenchStore.getState().blocks[0].content).toBe('Updated');
  });

  it('switches type via slash command', () => {
    render(<EditorPanel />);
    const textarea = screen.getByDisplayValue('Initial');
    
    fireEvent.change(textarea, { target: { value: '/code ' } });
    
    const block = useWorkbenchStore.getState().blocks[0];
    expect(block.type).toBe('code');
    expect(block.content).toBe('');
  });
});
