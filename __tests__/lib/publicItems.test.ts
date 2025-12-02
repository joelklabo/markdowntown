import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    snippet: { findMany: vi.fn() },
    template: { findMany: vi.fn() },
    document: { findMany: vi.fn() },
  },
  hasDatabaseEnv: true,
}));

import { prisma } from "@/lib/prisma";
import { listPublicItems } from "@/lib/publicItems";

describe("listPublicItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const now = new Date();
    (prisma.snippet.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "s1",
        slug: "s1",
        title: "Snippet One",
        content: "Hello",
        tags: ["System Prompt"],
        views: 10,
        copies: 2,
        votesUp: 3,
        votesDown: 1,
        createdAt: now,
      },
    ]);

    (prisma.template.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "t1",
        slug: "t1",
        title: "Template",
        description: "Describe",
        tags: ["style"],
        views: 5,
        copies: 4,
        uses: 7,
        createdAt: now,
      },
    ]);

    (prisma.document.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "d1",
        slug: "d1",
        title: "Doc",
        description: "Doc desc",
        renderedContent: "",
        tags: ["file"],
        views: 8,
        copies: 9,
        createdAt: now,
      },
    ]);
  });

  it("merges types and normalizes tags", async () => {
    const items = await listPublicItems({ limit: 10 });
    const tags = items.flatMap((i) => i.tags);
    expect(tags).toContain("system-prompt");
    expect(tags).toContain("style");
    expect(items.map((i) => i.type)).toEqual(expect.arrayContaining(["snippet", "template", "file"]));
  });

  it("sorts by copies when requested", async () => {
    const items = await listPublicItems({ sort: "copies" });
    expect(items[0].stats.copies).toBeGreaterThanOrEqual(items[1].stats.copies);
  });

  it("limits to a specific type", async () => {
    const items = await listPublicItems({ type: "template", limit: 5 });
    expect(items.every((i) => i.type === "template")).toBe(true);
  });
});
