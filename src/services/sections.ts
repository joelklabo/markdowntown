import { prisma } from "@/lib/prisma";
import { normalizeTags } from "@/lib/tags";

export type SectionRecord = {
  id: string;
  slug?: string | null;
  title: string;
  content: string;
  tags: string[];
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface SectionsRepo {
  listPublic(limit?: number): Promise<SectionRecord[]>;
  findByIdOrSlug(idOrSlug: string): Promise<SectionRecord | null>;
}

class PrismaSectionsRepo implements SectionsRepo {
  async listPublic(limit = 24): Promise<SectionRecord[]> {
    const rows = await prisma.snippet.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
    return rows.map((r) => ({ ...r, tags: normalizeTags(r.tags, { strict: false }).tags }));
  }

  async findByIdOrSlug(idOrSlug: string): Promise<SectionRecord | null> {
    const row = await prisma.snippet.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], visibility: "PUBLIC" },
    });
    return row ? { ...row, tags: normalizeTags(row.tags, { strict: false }).tags } : null;
  }
}

export const sectionsRepo: SectionsRepo = new PrismaSectionsRepo();
