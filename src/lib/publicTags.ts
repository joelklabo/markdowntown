import { Prisma, prisma } from "./prisma";

export type PublicTag = { tag: string; count: number };

async function queryTags(limit: number, windowDays?: number | null): Promise<PublicTag[]> {
  const whereWindow = windowDays
    ? Prisma.sql`AND "updatedAt" > NOW() - make_interval(days => ${windowDays})`
    : Prisma.empty;

  const results = await prisma.$queryRaw<
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

  return results.map((row) => ({ tag: row.tag, count: Number(row.count) }));
}

export async function listTopTags(limit = 50, windowDays?: number | null) {
  return queryTags(limit, windowDays);
}

export async function listSpotlightTags(limit = 20) {
  // Spotlight favors recent activity (7d)
  return queryTags(limit, 7);
}
