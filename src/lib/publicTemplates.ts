import { unstable_cache } from "next/cache";
import { normalizeTags } from "./tags";
import { cacheTags } from "./cacheTags";
import { getServices } from "@/services";
import { sampleItems } from "./sampleContent";

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
    const template = await getServices().templates.findPublicByIdOrSlug(idOrSlug);
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
  const { templates: templatesRepo } = getServices();
  const cached = unstable_cache(
    async () => {
      try {
        const template = await templatesRepo.findPublicByIdOrSlug(idOrSlug);
        if (template) {
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
        }
      } catch (err) {
        // fall through to sample content when database is unavailable
        console.warn("publicTemplates: falling back to samples", err);
      }

      const sample = sampleItems.find((i) => (i.slug ?? i.id) === idOrSlug && i.type === "template");
      if (sample) {
        const now = new Date();
        return {
          id: sample.id,
          slug: sample.slug ?? sample.id,
          title: sample.title,
          description: sample.description,
          body: sample.description ?? "",
          fields: [],
          tags: normalizeTags(sample.tags, { strict: false }).tags,
          stats: {
            views: sample.stats.views,
            copies: sample.stats.copies,
            downloads: 0,
            uses: sample.stats.votes,
          },
          updatedAt: now,
          createdAt: now,
        };
      }
      return null;
    },
    ["public-template", idOrSlug],
    { revalidate: 300, tags: [cacheTags.detail("template", idOrSlug), cacheTags.list("template")] }
  );

  return cached();
}
