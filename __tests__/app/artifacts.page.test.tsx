import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArtifactPage from '@/app/artifacts/[slug]/page';

vi.mock('@/lib/publicItems', () => ({
  getPublicItem: vi.fn().mockResolvedValue({
    id: '1',
    slug: 'test-artifact',
    title: 'Test Artifact',
    description: 'Desc',
    type: 'agent',
    tags: ['ai'],
    version: 1,
    content: { kind: 'UniversalAgent', blocks: [] },
    stats: { views: 0, copies: 0, votes: 0 },
    createdAt: new Date(),
  }),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

describe('ArtifactPage', () => {
  it('renders artifact details', async () => {
    const jsx = await ArtifactPage({ params: Promise.resolve({ slug: 'test-artifact' }) });
    render(jsx);
    
    expect(screen.getByText('Test Artifact')).toBeInTheDocument();
    expect(screen.getByText('v1')).toBeInTheDocument();
    expect(screen.getByText(/UniversalAgent/)).toBeInTheDocument();
  });
});
