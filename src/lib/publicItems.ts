import { normalizeTags } from "./tags";
import { unstable_cache } from "next/cache";
import { cacheTags, type PublicListType } from "./cacheTags";
import { getServices } from "@/services";
import { sampleItems } from "./sampleContent";

const isTestEnv = process.env.NODE_ENV === "test";

export type PublicItemType = "snippet" | "template" | "file";

export type PublicItem = {
  id: string;
  slug?: string | null;
  title: string;
  description: string;
  tags: string[];
  stats: { views: number; copies: number; votes: number };
  type: PublicItemType;
  createdAt: Date;
};

export type ListPublicItemsInput = {
  limit?: number;
  tags?: unknown;
  type?: PublicItemType | "all";
  sort?: "recent" | "views" | "copies";
  search?: string | null;
};

function normalizeInputTags(input?: unknown): string[] {
  return normalizeTags(input, { strict: false }).tags;
}

function toItem<T extends { createdAt: Date }>(
  row: T,
  fields: {
    id: string;
    slug?: string | null;
    title: string;
    description: string | null;
    tags: unknown;
    stats: { views?: number; copies?: number; votes?: number };
    type: PublicItemType;
  }
): PublicItem {
  const tags = normalizeInputTags(fields.tags);
  return {
    id: fields.id,
    slug: fields.slug,
    title: fields.title,
    description: (fields.description ?? "").slice(0, 240),
    tags,
    stats: {
      views: fields.stats.views ?? 0,
      copies: fields.stats.copies ?? 0,
      votes: fields.stats.votes ?? 0,
    },
    type: fields.type,
    createdAt: row.createdAt,
  };
}

async function listPublicItemsRaw(input: ListPublicItemsInput = {}): Promise<PublicItem[]> {
  const { limit = 30, tags = [], type = "all", sort = "recent", search = null } = input;
  const normalizedTags = normalizeInputTags(tags);
  const wantSnippets = type === "all" || type === "snippet";
  const wantTemplates = type === "all" || type === "template";
  const wantFiles = type === "all" || type === "file";
  const { sections: sectionsRepo, templates: templatesRepo, documents: documentsRepo } = getServices();

  const rows: PublicItem[] = [];

  try {
    if (wantSnippets) {
      const snippets = await sectionsRepo.listPublic({ tags: normalizedTags, search, limit: Math.min(limit * 2, 60) });
      rows.push(
        ...snippets.map((s) =>
          toItem(s, {
            id: s.id,
            slug: s.slug,
            title: s.title,
            description: s.content.slice(0, 240),
            tags: s.tags,
            stats: {
              views: (s as { views?: number }).views ?? 0,
              copies: (s as { copies?: number }).copies ?? 0,
              votes: 0,
            },
            type: "snippet",
          })
        )
      );
    }

    if (wantTemplates) {
      const templates = await templatesRepo.listPublic({ tags: normalizedTags, search, limit: Math.min(limit * 2, 60) });
      rows.push(
        ...templates.map((t) =>
          toItem(t, {
            id: t.id,
            slug: t.slug,
            title: t.title,
            description: t.description ?? "",
            tags: t.tags,
            stats: {
              views: t.views,
              copies: t.copies,
              votes: t.uses ?? 0,
            },
            type: "template",
          })
        )
      );
    }

    if (wantFiles) {
      const documents = await documentsRepo.listPublic({
        tags: normalizedTags,
        search,
        limit: Math.min(limit * 2, 60),
      });
      rows.push(
        ...documents.map((d) =>
          toItem(d, {
            id: d.id,
            slug: d.slug,
            title: d.title,
            description: d.description ?? d.renderedContent ?? "",
            tags: d.tags,
            stats: {
              views: d.views,
              copies: d.copies,
              votes: 0,
            },
            type: "file",
          })
        )
      );
    }
  } catch (err) {
    console.warn("publicItems: falling back to sample content", err);
    return sampleItems
      .filter((item) => type === "all" || item.type === type)
      .slice(0, limit)
      .map((item, idx) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        tags: normalizeInputTags(item.tags),
        stats: {
          views: item.stats.views,
          copies: item.stats.copies,
          votes: item.stats.votes,
        },
        type: item.type,
        createdAt: new Date(Date.now() - idx * 60_000),
      }));
  }

  const sorted = rows.sort((a, b) => {
    if (sort === "views") return b.stats.views - a.stats.views || b.createdAt.getTime() - a.createdAt.getTime();
    if (sort === "copies") return b.stats.copies - a.stats.copies || b.createdAt.getTime() - a.createdAt.getTime();
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return sorted.slice(0, limit);
}

const listCache = new Map<PublicListType, ReturnType<typeof unstable_cache>>();

function getListCache(type: PublicListType) {
  if (!listCache.has(type)) {
    listCache.set(
      type,
      unstable_cache(
        async (input: ListPublicItemsInput = {}) => listPublicItemsRaw({ ...input, type }),
        ["public-items", type],
        { revalidate: 60, tags: [cacheTags.list("all"), cacheTags.list(type), cacheTags.landing] }
      )
    );
  }
  return listCache.get(type)!;
}

export async function listPublicItems(input: ListPublicItemsInput = {}): Promise<PublicItem[]> {
  const type = (input.type ?? "all") as PublicListType;
  if (isTestEnv) return listPublicItemsRaw({ ...input, type });
  const cached = getListCache(type);
  return cached(input);
}
