import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { normalizeTags } from "./tags";
import { cacheTags } from "./cacheTags";

const isTestEnv = process.env.NODE_ENV === "test";

export type PublicTemplate = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  body: string;
  fields: unknown;
  tags: string[];
  stats: { views: number; copies: number; downloads: number; uses: number };
  updatedAt: Date;
  createdAt: Date;
};

export async function getPublicTemplate(idOrSlug: string): Promise<PublicTemplate | null> {
  if (isTestEnv) {
    const template = await prisma.template.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], visibility: "PUBLIC" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        body: true,
        fields: true,
        tags: true,
        views: true,
        copies: true,
        downloads: true,
        uses: true,
        updatedAt: true,
        createdAt: true,
      },
    });
    return template
      ? {
          id: template.id,
          slug: template.slug,
          title: template.title,
          description: template.description,
          body: template.body,
          fields: template.fields,
          tags: normalizeTags(template.tags, { strict: false }).tags,
          stats: {
            views: template.views,
            copies: template.copies,
            downloads: template.downloads,
            uses: template.uses,
          },
          updatedAt: template.updatedAt,
          createdAt: template.createdAt,
        }
      : null;
  }
  const cached = unstable_cache(
    async () => {
      const template = await prisma.template.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
          visibility: "PUBLIC",
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          body: true,
          fields: true,
          tags: true,
          views: true,
          copies: true,
          downloads: true,
          uses: true,
          updatedAt: true,
          createdAt: true,
        },
      });
      if (!template) return null;
      return {
        id: template.id,
        slug: template.slug,
        title: template.title,
        description: template.description,
        body: template.body,
        fields: template.fields,
        tags: normalizeTags(template.tags, { strict: false }).tags,
        stats: {
          views: template.views,
          copies: template.copies,
          downloads: template.downloads,
          uses: template.uses,
        },
        updatedAt: template.updatedAt,
        createdAt: template.createdAt,
      };
    },
    ["public-template", idOrSlug],
    { revalidate: 300, tags: [cacheTags.detail("template", idOrSlug), cacheTags.list("template")] }
  );

  return cached();
}
