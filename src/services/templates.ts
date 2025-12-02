import { prisma } from "@/lib/prisma";
import { normalizeTags } from "@/lib/tags";

export type TemplateRecord = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tags: string[];
  views: number;
  copies: number;
  uses: number | null;
  createdAt: Date;
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
};

export interface TemplatesRepo {
  listPublic(input: {
    tags?: string[];
    search?: string | null;
    limit?: number;
  }): Promise<TemplateRecord[]>;
  findPublicBySlug(slug: string): Promise<TemplateRecord | null>;
}

class PrismaTemplatesRepo implements TemplatesRepo {
  async listPublic(input: { tags?: string[]; search?: string | null; limit?: number }) {
    const { tags = [], search = null, limit = 60 } = input;
    const where: NonNullable<Parameters<typeof prisma.template.findMany>[0]>["where"] = {
      visibility: "PUBLIC",
    };
    if (tags.length) where.tags = { hasEvery: tags };
    if (search) where.title = { contains: search, mode: "insensitive" };
    const rows = await prisma.template.findMany({
      where,
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
        visibility: true,
      },
      take: limit,
    });
    return rows.map((r) => ({
      ...r,
      tags: normalizeTags(r.tags, { strict: false }).tags,
    }));
  }

  async findPublicBySlug(slug: string) {
    const row = await prisma.template.findFirst({
      where: { slug, visibility: "PUBLIC" },
    });
    return row ? { ...row, tags: normalizeTags(row.tags, { strict: false }).tags } : null;
  }
}

export const templatesRepo: TemplatesRepo = new PrismaTemplatesRepo();
