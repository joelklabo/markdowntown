import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ArtifactType, Visibility, Prisma } from '@prisma/client';

const SaveSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(ArtifactType).default('ARTIFACT'),
  visibility: z.nativeEnum(Visibility).default('PRIVATE'),
  tags: z.array(z.string()).default([]),
  uam: z.unknown(),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await req.json();
    const body = SaveSchema.parse(json);

    let artifact;

    if (body.id) {
      // Update existing
      const existing = await prisma.artifact.findUnique({
        where: { id: body.id },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
      }

      if (existing.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Calculate next numeric version (stored as a string). Ignore non-numeric versions like "draft".
      const versions = await prisma.artifactVersion.findMany({
        where: { artifactId: body.id },
        select: { version: true },
      });
      const maxNumeric = versions.reduce((max, v) => {
        const parsed = Number.parseInt(v.version, 10);
        return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
      }, 0);
      const nextVersion = String(maxNumeric + 1);

      artifact = await prisma.artifact.update({
        where: { id: body.id },
        data: {
          title: body.title,
          description: body.description,
          visibility: body.visibility,
          tags: body.tags,
          versions: {
            create: {
              version: nextVersion,
              uam: body.uam as Prisma.InputJsonValue, // JSON
              message: body.message,
            },
          },
        },
      });
    } else {
      // Create new
      artifact = await prisma.artifact.create({
        data: {
          title: body.title,
          description: body.description,
          type: body.type,
          visibility: body.visibility,
          tags: body.tags,
          userId: session.user.id,
          versions: {
            create: {
              version: '1',
              uam: body.uam as Prisma.InputJsonValue,
              message: body.message ?? 'Initial version',
            },
          },
        },
      });
    }

    return NextResponse.json(artifact);
  } catch (error) {
    console.error('Save artifact error:', error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
