import { normalizeTags } from "./tags";
import { unstable_cache } from "next/cache";
import { cacheTags, type PublicListType } from "./cacheTags";
import { prisma, hasDatabaseEnv } from "@/lib/prisma";
import { ArtifactType, Prisma } from "@prisma/client";
import { safeParseUamV1 } from "@/lib/uam/uamValidate";

const isTestEnv = process.env.NODE_ENV === "test";

export type PublicItemType = "snippet" | "template" | "file" | "agent";

export type PublicItem = {
  id: string;
  slug?: string | null;
  title: string;
  description: string;
  tags: string[];
  targets: string[];
  hasScopes: boolean;
  lintGrade: string | null;
  scopeCount: number;
  blockCount: number;
  stats: { views: number; copies: number; votes: number };
  type: PublicItemType;
  createdAt: Date;
};

export type PublicItemDetail = PublicItem & {
  content: unknown;
  version: string;
};

export type ListPublicItemsInput = {
  limit?: number;
  tags?: unknown;
  targets?: unknown;
  hasScopes?: unknown;
  type?: PublicItemType | "all";
  sort?: "recent" | "views" | "copies";
  search?: string | null;
};

function normalizeInputTags(input?: unknown): string[] {
  return normalizeTags(input, { strict: false }).tags;
}

function normalizeInputTargets(input?: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map(v => String(v).trim()).filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map(v => v.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeInputHasScopes(input?: unknown): boolean | undefined {
  if (typeof input === "boolean") return input;
  if (typeof input === "string") {
    const normalized = input.trim().toLowerCase();
    if (["1", "true", "yes", "y"].includes(normalized)) return true;
    if (["0", "false", "no", "n"].includes(normalized)) return false;
  }
  return undefined;
}

const artifactTypeByPublicType: Record<PublicItemType, ArtifactType> = {
  snippet: "MODULE",
  template: "TEMPLATE",
  file: "ARTIFACT",
  agent: "ARTIFACT",
};

function toPublicType(t: ArtifactType): PublicItemType {
  if (t === "TEMPLATE") return "template";
  if (t === "MODULE") return "snippet";
  return "agent";
}

function countsFromUam(raw: unknown): { scopeCount: number; blockCount: number } {
  const parsed = safeParseUamV1(raw);
  if (!parsed.success) return { scopeCount: 0, blockCount: 0 };
  return { scopeCount: parsed.data.scopes.length, blockCount: parsed.data.blocks.length };
}

async function listPublicItemsRaw(input: ListPublicItemsInput = {}): Promise<PublicItem[]> {
  const { limit = 30, tags = [], type = "all", sort = "recent", search = null } = input;
  const normalizedTags = normalizeInputTags(tags);
  const normalizedTargets = normalizeInputTargets(input.targets);
  const hasScopesFilter = normalizeInputHasScopes(input.hasScopes);

  if (!hasDatabaseEnv) {
    return [];
  }

  const where: Prisma.ArtifactWhereInput = {
    visibility: "PUBLIC",
  };

  if (type !== "all" && artifactTypeByPublicType[type]) {
    where.type = artifactTypeByPublicType[type];
  }

  if (normalizedTags.length > 0) {
    where.tags = { hasSome: normalizedTags };
  }

  if (normalizedTargets.length > 0) {
    where.targets = { hasSome: normalizedTargets };
  }

  if (hasScopesFilter !== undefined) {
    where.hasScopes = hasScopesFilter;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ArtifactOrderByWithRelationInput = {};
  if (sort === "views") orderBy.views = "desc";
  else if (sort === "copies") orderBy.copies = "desc";
  else orderBy.createdAt = "desc";

  try {
    const artifacts = await prisma.artifact.findMany({
      where,
      take: Math.min(limit, 100),
      orderBy,
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { uam: true },
        },
      },
    });

    return artifacts.map(a => ({
      ...countsFromUam(a.versions[0]?.uam),
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: (a.description ?? "").slice(0, 240),
      tags: normalizeTags(a.tags, { strict: false }).tags,
      targets: a.targets,
      hasScopes: a.hasScopes,
      lintGrade: a.lintGrade ?? null,
      stats: {
        views: a.views,
        copies: a.copies,
        votes: a.votesUp || 0,
      },
      type: toPublicType(a.type),
      createdAt: a.createdAt,
    }));
  } catch (err) {
    console.warn("publicItems: error fetching artifacts", err);
    return [];
  }
}

async function getPublicItemRaw(slug: string): Promise<PublicItemDetail | null> {
  if (!hasDatabaseEnv) return null;

  try {
    const artifact = await prisma.artifact.findFirst({
      where: {
        OR: [{ id: slug }, { slug }],
        visibility: "PUBLIC",
      },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!artifact) return null;
    const latest = artifact.versions[0];
    const counts = countsFromUam(latest?.uam);

    return {
      ...counts,
      id: artifact.id,
      slug: artifact.slug,
      title: artifact.title,
      description: artifact.description ?? "",
      tags: artifact.tags,
      targets: artifact.targets,
      hasScopes: artifact.hasScopes,
      lintGrade: artifact.lintGrade ?? null,
      stats: {
        views: artifact.views,
        copies: artifact.copies,
        votes: artifact.votesUp || 0,
      },
      type: toPublicType(artifact.type),
      createdAt: artifact.createdAt,
      content: latest?.uam ?? {},
      version: latest?.version ?? "draft",
    };
  } catch (err) {
    console.warn("getPublicItem: error", err);
    return null;
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

const detailCache = new Map<string, ReturnType<typeof unstable_cache>>();

export async function getPublicItem(slug: string): Promise<PublicItemDetail | null> {
  if (isTestEnv) return getPublicItemRaw(slug);
  const key = `detail:${slug}`;
  if (!detailCache.has(key)) {
    detailCache.set(
      key,
      unstable_cache(async (s: string) => getPublicItemRaw(s), ["public-item-detail", slug], {
        revalidate: 60,
        tags: [cacheTags.detail("all", slug)],
      })
    );
  }
  return detailCache.get(key)!(slug);
}
