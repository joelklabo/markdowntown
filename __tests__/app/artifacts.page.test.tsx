import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArtifactDetailPage from '@/app/a/[slug]/page';

vi.mock('@/lib/publicItems', () => ({
  getPublicItem: vi.fn().mockResolvedValue({
    id: '1',
    slug: 'test-artifact',
    title: 'Test Artifact',
    description: 'Desc',
    type: 'agent',
    tags: ['ai'],
    targets: ['agents-md'],
    hasScopes: true,
    lintGrade: 'A',
    scopeCount: 1,
    blockCount: 2,
    version: '1',
    content: { schemaVersion: 1, meta: { title: 'Test Artifact' }, scopes: [], blocks: [] },
    stats: { views: 0, copies: 0, votes: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
}));

describe('ArtifactPage', () => {
  it('renders artifact details', async () => {
    const jsx = await ArtifactDetailPage({ params: Promise.resolve({ slug: 'test-artifact' }) });
    render(jsx);
    
    expect(screen.getAllByText('Test Artifact').length).toBeGreaterThan(0);
    expect(screen.getByText('agents-md')).toBeInTheDocument();
    expect(screen.getByText('Rendered')).toBeInTheDocument();
    expect(screen.getByText('Raw')).toBeInTheDocument();
    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('Lint')).toBeInTheDocument();
    expect(screen.getByText('Versions')).toBeInTheDocument();
  });
});
