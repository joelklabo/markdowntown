import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ?? null;

  const idOrSlug = params.id;
  const artifact = await prisma.artifact.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true, visibility: true, userId: true },
  });

  if (!artifact) {
    return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
  }

  const isOwner = viewerId !== null && artifact.userId === viewerId;
  if (artifact.visibility === 'PRIVATE' && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const versions = await prisma.artifactVersion.findMany({
    where: { artifactId: artifact.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      version: true,
      message: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ artifactId: artifact.id, versions });
}

