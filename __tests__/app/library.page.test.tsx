import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LibraryPage from '@/app/library/page';

vi.mock('@/lib/publicItems', () => ({
  listPublicItems: vi.fn().mockResolvedValue([
    {
      id: '1',
      title: 'Test Agent',
      description: 'Desc',
      type: 'agent',
      tags: ['ai'],
      stats: { views: 10, copies: 1, votes: 0 },
      createdAt: new Date(),
    }
  ]),
}));

describe('LibraryPage', () => {
  it('renders items', async () => {
    const jsx = await LibraryPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('Agent')).toBeInTheDocument();
  });
});
