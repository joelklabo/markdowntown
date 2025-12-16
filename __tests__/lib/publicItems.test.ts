import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artifact: { findMany: vi.fn() },
  },
  hasDatabaseEnv: true,
}));

import { prisma } from "@/lib/prisma";
import { listPublicItems } from "@/lib/publicItems";

describe("listPublicItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const now = new Date();
    (prisma.artifact.findMany as unknown as ReturnType<typeof vi.fn>).mockImplementation(async ({ where }) => {
      const allArtifacts = [
        {
          id: "s1",
          slug: "s1",
          type: "SNIPPET",
          title: "Snippet One",
          description: "Hello",
          tags: ["System Prompt"],
          views: 10,
          copies: 2,
          votesUp: 3,
          votesDown: 1,
          createdAt: now,
        },
        {
          id: "t1",
          slug: "t1",
          type: "TEMPLATE",
          title: "Template",
          description: "Describe",
          tags: ["style"],
          views: 5,
          copies: 4,
          uses: 7,
          createdAt: now,
        },
        {
          id: "d1",
          slug: "d1",
          type: "DOCUMENT",
          title: "Doc",
          description: "Doc desc",
          tags: ["file"],
          views: 8,
          copies: 9,
          createdAt: now,
        },
      ];
      
      if (where?.type) {
        return allArtifacts.filter(a => a.type === where.type);
      }
      return allArtifacts;
    });
  });

  it("merges types and normalizes tags", async () => {
    const items = await listPublicItems({ limit: 10 });
    const tags = items.flatMap((i) => i.tags);
    expect(tags).toContain("system-prompt");
    expect(tags).toContain("style");
    expect(items.map((i) => i.type)).toEqual(expect.arrayContaining(["snippet", "template", "file"]));
  });

  it("limits to a specific type", async () => {
    const items = await listPublicItems({ type: "template", limit: 5 });
    expect(items.every((i) => i.type === "template")).toBe(true);
  });
});