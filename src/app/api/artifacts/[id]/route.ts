import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { auditLog, withAPM } from '@/lib/observability';
import { prisma } from '@/lib/prisma';
import { Visibility } from '@prisma/client';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  return withAPM(_req, async () => {
    const session = await getServerSession(authOptions);
    const viewerId = session?.user?.id ?? null;

    const { id: idOrSlug } = await context.params;

    const artifact = await prisma.artifact.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!artifact) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    }

    const isOwner = viewerId !== null && artifact.userId === viewerId;
    if (artifact.visibility === 'PRIVATE' && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const latestVersion = artifact.versions[0] ?? null;
    return NextResponse.json({ artifact, latestVersion });
  });
}

const PatchSchema = z.object({
  visibility: z.nativeEnum(Visibility),
});

export async function PATCH(req: Request, context: RouteContext) {
  return withAPM(req, async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json().catch(() => null);
    const parsed = PatchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.issues }, { status: 400 });
    }

    const { id: idOrSlug } = await context.params;
    const existing = await prisma.artifact.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.artifact.update({
      where: { id: existing.id },
      data: { visibility: parsed.data.visibility },
    });

    auditLog('artifact_visibility_update', {
      actorId: session.user.id,
      artifactId: existing.id,
      visibility: parsed.data.visibility,
    });

    return NextResponse.json(updated);
  });
}
