import { unstable_cache } from "next/cache";
import { cacheTags } from "./cacheTags";
import { normalizeTags } from "./tags";
import { hasDatabaseEnv, prisma } from "./prisma";
import { safeParseUamV1 } from "./uam/uamValidate";
import type { PublicSkillDetail, PublicSkillSummary, ListPublicSkillsInput, SkillCapabilitySummary } from "./skills/skillTypes";
import { ArtifactType, Prisma } from "@prisma/client";

const isTestEnv = process.env.NODE_ENV === "test";

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

function summarizeCapabilities(raw: unknown): { capabilities: SkillCapabilitySummary[]; capabilityCount: number } {
  const parsed = safeParseUamV1(raw);
  if (!parsed.success) return { capabilities: [], capabilityCount: 0 };
  const capabilities = parsed.data.capabilities.map(({ id, title, description }) => ({ id, title, description }));
  return { capabilities, capabilityCount: capabilities.length };
}

function sortOrder(sort?: ListPublicSkillsInput["sort"]): Prisma.ArtifactOrderByWithRelationInput {
  if (sort === "views") return { views: "desc" };
  if (sort === "copies") return { copies: "desc" };
  return { createdAt: "desc" };
}

async function listPublicSkillsRaw(input: ListPublicSkillsInput = {}): Promise<PublicSkillSummary[]> {
  if (!hasDatabaseEnv) return [];
  const { limit = 30, search = null } = input;
  const normalizedTags = normalizeInputTags(input.tags);
  const normalizedTargets = normalizeInputTargets(input.targets);

  const where: Prisma.ArtifactWhereInput = {
    visibility: "PUBLIC",
    type: ArtifactType.SKILL,
  };

  if (normalizedTags.length > 0) {
    where.tags = { hasSome: normalizedTags };
  }

  if (normalizedTargets.length > 0) {
    where.targets = { hasSome: normalizedTargets };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const artifacts = await prisma.artifact.findMany({
      where,
      take: Math.min(limit, 100),
      orderBy: sortOrder(input.sort),
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { uam: true },
        },
      },
    });

    return artifacts.map(artifact => {
      const { capabilities, capabilityCount } = summarizeCapabilities(artifact.versions[0]?.uam);
      return {
        id: artifact.id,
        slug: artifact.slug,
        title: artifact.title,
        description: artifact.description ?? "",
        tags: normalizeTags(artifact.tags, { strict: false }).tags,
        targets: artifact.targets,
        capabilityCount,
        capabilities,
        createdAt: artifact.createdAt,
        updatedAt: artifact.updatedAt,
      };
    });
  } catch (err) {
    console.warn("publicSkills: error fetching skills", err);
    return [];
  }
}

async function getPublicSkillRaw(idOrSlug: string): Promise<PublicSkillDetail | null> {
  if (!hasDatabaseEnv) return null;

  try {
    const artifact = await prisma.artifact.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        visibility: "PUBLIC",
        type: ArtifactType.SKILL,
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
    const { capabilities, capabilityCount } = summarizeCapabilities(latest?.uam);
    const parsed = safeParseUamV1(latest?.uam ?? {});
    if (!parsed.success) return null;

    return {
      id: artifact.id,
      slug: artifact.slug,
      title: artifact.title,
      description: artifact.description ?? "",
      tags: normalizeTags(artifact.tags, { strict: false }).tags,
      targets: artifact.targets,
      capabilityCount,
      capabilities,
      createdAt: artifact.createdAt,
      updatedAt: latest?.createdAt ?? artifact.updatedAt,
      content: parsed.data,
      version: latest?.version ?? "draft",
    };
  } catch (err) {
    console.warn("publicSkills: error fetching skill detail", err);
    return null;
  }
}

const listCache = unstable_cache(
  async (input: ListPublicSkillsInput = {}) => listPublicSkillsRaw(input),
  ["public-skills"],
  { revalidate: 60, tags: [cacheTags.list("skill"), cacheTags.landing] }
);

export async function listPublicSkills(input: ListPublicSkillsInput = {}): Promise<PublicSkillSummary[]> {
  if (isTestEnv) return listPublicSkillsRaw(input);
  return listCache(input);
}

const detailCache = new Map<string, ReturnType<typeof unstable_cache>>();

export async function getPublicSkill(idOrSlug: string): Promise<PublicSkillDetail | null> {
  if (isTestEnv) return getPublicSkillRaw(idOrSlug);
  if (!detailCache.has(idOrSlug)) {
    detailCache.set(
      idOrSlug,
      unstable_cache(async (key: string) => getPublicSkillRaw(key), ["public-skill", idOrSlug], {
        revalidate: 60,
        tags: [cacheTags.detail("skill", idOrSlug)],
      })
    );
  }
  return detailCache.get(idOrSlug)!(idOrSlug);
}
