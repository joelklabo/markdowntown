import { Prisma, prisma } from "./prisma";
import { normalizeTags } from "./tags";

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

export async function listPublicItems(input: ListPublicItemsInput = {}): Promise<PublicItem[]> {
  try {
    const {
      limit = 30,
      tags = [],
      type = "all",
      sort = "recent",
      search = null,
    } = input;

    const normalizedTags = normalizeInputTags(tags);

    const whereCommon = (table: "Snippet" | "Template" | "Document") => {
      const where: Prisma.SnippetWhereInput | Prisma.TemplateWhereInput | Prisma.DocumentWhereInput = {
        visibility: "PUBLIC",
      };

      if (normalizedTags.length) {
        (where as Record<string, unknown>).tags = { hasEvery: normalizedTags };
      }

      if (search) {
        const searchField = table === "Snippet" ? "title" : "title";
        (where as Record<string, unknown>)[searchField] = { contains: search, mode: "insensitive" };
      }

      return where;
    };

    const wantSnippets = type === "all" || type === "snippet";
    const wantTemplates = type === "all" || type === "template";
    const wantFiles = type === "all" || type === "file";

    const rows: PublicItem[] = [];

    if (wantSnippets) {
      const snippets = await prisma.snippet.findMany({
        where: whereCommon("Snippet"),
        select: {
          id: true,
          slug: true,
          title: true,
          content: true,
          tags: true,
          views: true,
          copies: true,
          votesUp: true,
          votesDown: true,
          createdAt: true,
        },
        take: Math.min(limit * 2, 60),
      });

      rows.push(
        ...snippets.map((s) =>
          toItem(s, {
            id: s.id,
            slug: s.slug,
            title: s.title,
            description: s.content.slice(0, 240),
            tags: s.tags,
            stats: {
              views: s.views,
              copies: s.copies,
              votes: (s.votesUp ?? 0) - (s.votesDown ?? 0),
            },
            type: "snippet",
          })
        )
      );
    }

    if (wantTemplates) {
      const templates = await prisma.template.findMany({
        where: whereCommon("Template"),
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          tags: true,
          views: true,
          copies: true,
          uses: true,
          createdAt: true,
        },
        take: Math.min(limit * 2, 60),
      });

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
      const documents = await prisma.document.findMany({
        where: whereCommon("Document"),
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          renderedContent: true,
          tags: true,
          views: true,
          copies: true,
          createdAt: true,
        },
        take: Math.min(limit * 2, 60),
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

    const sorted = rows.sort((a, b) => {
      if (sort === "views") return b.stats.views - a.stats.views || b.createdAt.getTime() - a.createdAt.getTime();
      if (sort === "copies") return b.stats.copies - a.stats.copies || b.createdAt.getTime() - a.createdAt.getTime();
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return sorted.slice(0, limit);
  } catch (err) {
    console.warn("publicItems: falling back to empty list", err);
    return [];
  }
}
