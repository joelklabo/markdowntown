import { normalizeTags } from "./tags";
import { unstable_cache } from "next/cache";
import { cacheTags } from "./cacheTags";
import { prisma, hasDatabaseEnv } from "@/lib/prisma";
import { ArtifactType, Prisma } from "@prisma/client";

const isTestEnv = process.env.NODE_ENV === "test";

export type PublicItemType = "snippet" | "template" | "file" | "agent";

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

async function listPublicItemsRaw(input: ListPublicItemsInput = {}): Promise<PublicItem[]> {
  const { limit = 30, tags = [], type = "all", sort = "recent", search = null } = input;
  const normalizedTags = normalizeInputTags(tags);
  
  if (!hasDatabaseEnv) {
    return [];
  }

  const typeMap: Record<string, ArtifactType> = {
    snippet: 'SNIPPET',
    template: 'TEMPLATE',
    file: 'DOCUMENT',
    agent: 'AGENT'
  };

  const where: Prisma.ArtifactWhereInput = {
    visibility: 'PUBLIC',
  };

  if (type !== 'all' && typeMap[type]) {
    where.type = typeMap[type];
  }

  if (normalizedTags.length > 0) {
    where.tags = { hasSome: normalizedTags };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.ArtifactOrderByWithRelationInput = {};
  if (sort === 'views') orderBy.views = 'desc';
  else if (sort === 'copies') orderBy.copies = 'desc';
  else orderBy.createdAt = 'desc';

  try {
    const artifacts = await prisma.artifact.findMany({
      where,
      take: Math.min(limit, 100),
      orderBy,
    });

    return artifacts.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: (a.description ?? "").slice(0, 240),
      tags: a.tags,
      stats: {
        views: a.views,
        copies: a.copies,
        votes: a.votesUp || 0,
      },
      type: (a.type === 'DOCUMENT' ? 'file' : a.type.toLowerCase()) as PublicItemType,
      createdAt: a.createdAt,
    }));
  } catch (err) {
    console.warn("publicItems: error fetching artifacts", err);
    return [];
  }
}

const listCache = new Map<string, ReturnType<typeof unstable_cache>>();

function getListCache(type: string) {
  if (!listCache.has(type)) {
    listCache.set(
      type,
      unstable_cache(
        async (input: ListPublicItemsInput = {}) => listPublicItemsRaw({ ...input, type: type as ListPublicItemsInput["type"] }),
        ["public-items", type],
        { revalidate: 60, tags: [cacheTags.list("all"), cacheTags.list(type as PublicListType), cacheTags.landing] }
      )
    );
  }
  return listCache.get(type)!;
}

export async function listPublicItems(input: ListPublicItemsInput = {}): Promise<PublicItem[]> {
  const type = input.type ?? "all";
  if (isTestEnv) return listPublicItemsRaw(input);
  const cached = getListCache(type);
  return cached(input);
}
