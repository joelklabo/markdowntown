import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { normalizeTags } from "./tags";

export type PublicTag = { tag: string; count: number };

async function queryTags(limit: number, windowDays?: number | null): Promise<PublicTag[]> {
  const whereWindow = windowDays
    ? Prisma.sql`AND "updatedAt" > NOW() - make_interval(days => ${windowDays})`
    : Prisma.empty;

  let results: { tag: string; count: bigint }[] = [];
  try {
    results = await prisma.$queryRaw<
      { tag: string; count: bigint }[]
    >(Prisma.sql`
      SELECT tag, COUNT(*)::int AS count
      FROM (
        SELECT unnest("tags") AS tag FROM "Snippet" WHERE "visibility" = 'PUBLIC' ${whereWindow}
        UNION ALL
        SELECT unnest("tags") AS tag FROM "Template" WHERE "visibility" = 'PUBLIC' ${whereWindow}
        UNION ALL
        SELECT unnest("tags") AS tag FROM "Document" WHERE "visibility" = 'PUBLIC' ${whereWindow}
      ) AS t
      GROUP BY tag
      ORDER BY count DESC
      LIMIT ${limit};
    `);
  } catch (err) {
    console.warn("publicTags: falling back to empty list", err);
    return [];
  }

  const aggregated = new Map<string, number>();

  results.forEach((row) => {
    const normalized = normalizeTags([row.tag], { strict: false }).tags[0];
    if (!normalized) return;
    aggregated.set(normalized, (aggregated.get(normalized) ?? 0) + Number(row.count));
  });

  return Array.from(aggregated.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

export async function listTopTags(limit = 50, windowDays?: number | null) {
  return queryTags(limit, windowDays);
}

export async function listSpotlightTags(limit = 20) {
  // Spotlight favors recent activity (7d)
  return queryTags(limit, 7);
}
