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
  type: z.nativeEnum(ArtifactType).default('AGENT'),
  visibility: z.nativeEnum(Visibility).default('PRIVATE'),
  tags: z.array(z.string()).default([]),
  content: z.unknown(),
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

      // Calculate next version
      const aggregate = await prisma.artifactVersion.aggregate({
        where: { artifactId: body.id },
        _max: { version: true },
      });
      const nextVersion = (aggregate._max.version ?? 0) + 1;

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
              content: body.content as Prisma.InputJsonValue, // Json
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
              version: 1,
              content: body.content as Prisma.InputJsonValue,
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
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
