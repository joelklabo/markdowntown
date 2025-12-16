import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StructurePanel } from '@/components/workbench/StructurePanel';
import { useWorkbenchStore } from '@/hooks/useWorkbenchStore';

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid',
  },
});

describe('StructurePanel', () => {
  beforeEach(() => {
    useWorkbenchStore.setState({
      blocks: [],
      selectedBlockId: null,
    });
  });

  it('renders and adds a block', async () => {
    render(<StructurePanel />);
    
    // Wait for enabled
    await waitFor(() => expect(screen.getByText('+ Add')).toBeInTheDocument());
    
    fireEvent.click(screen.getByText('+ Add'));
    
    expect(useWorkbenchStore.getState().blocks).toHaveLength(1);
    expect(useWorkbenchStore.getState().blocks[0].id).toBe('test-uuid');
    
    // Check if it appears in list
    expect(screen.getByText('(empty)')).toBeInTheDocument();
  });
  
  it('removes a block', async () => {
    useWorkbenchStore.setState({
      blocks: [{ id: 'b1', type: 'instruction', content: 'test-content' }],
    });
    
    render(<StructurePanel />);
    await waitFor(() => expect(screen.getByText('test-content')).toBeInTheDocument());
    
    const removeBtn = screen.getByLabelText('Remove block');
    fireEvent.click(removeBtn);
    
    expect(useWorkbenchStore.getState().blocks).toHaveLength(0);
  });
});
