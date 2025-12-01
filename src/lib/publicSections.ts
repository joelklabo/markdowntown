import { prisma } from "./prisma";

export type PublicSection = {
  id: string;
  slug?: string | null;
  title: string;
  content: string;
  updatedAt: Date;
  createdAt: Date;
};

export async function listPublicSections(limit = 24): Promise<PublicSection[]> {
  const sections = await prisma.snippet.findMany({
    where: {
      // Temporary safeguard: only expose seed/public sections (no owner) until visibility field is added.
      userId: null,
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      updatedAt: true,
      createdAt: true,
    },
  });
  return sections;
}

export async function getPublicSection(idOrSlug: string): Promise<PublicSection | null> {
  const section = await prisma.snippet.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      userId: null,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      updatedAt: true,
      createdAt: true,
    },
  });
  return section ?? null;
}
