import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/artifacts/save/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    artifact: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    artifactVersion: {
      findMany: vi.fn(),
    },
  },
}));

describe('POST /api/artifacts/save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthorized requests', async () => {
    (getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = new Request('http://localhost', { method: 'POST' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('creates new artifact', async () => {
    (getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'u1' } });
    (prisma.artifact.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'a1' });

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Agent',
        uam: { schemaVersion: 1, meta: { title: 'New Agent' }, scopes: [], blocks: [] },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.artifact.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        title: 'New Agent',
        userId: 'u1',
        versions: expect.any(Object),
      }),
    }));
  });

  it('updates existing artifact', async () => {
    (getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'u1' } });
    (prisma.artifact.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'a1', userId: 'u1' });
    (prisma.artifactVersion.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([{ version: '1' }]);
    (prisma.artifact.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'a1' });

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        id: 'a1',
        title: 'Updated Agent',
        uam: { schemaVersion: 1, meta: { title: 'Updated Agent' }, scopes: [], blocks: [] },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.artifact.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'a1' },
      data: expect.objectContaining({
        title: 'Updated Agent',
        versions: expect.objectContaining({
          create: expect.objectContaining({
            version: '2',
          }),
        }),
      }),
    }));
  });
});
