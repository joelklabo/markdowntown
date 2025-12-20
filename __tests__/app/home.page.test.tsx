import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { listPublicItems, listTopTags } = vi.hoisted(() => ({
  listPublicItems: vi.fn(),
  listTopTags: vi.fn(),
}));

vi.mock("@/lib/publicItems", () => ({
  listPublicItems,
}));

vi.mock("@/lib/publicTags", () => ({
  listTopTags,
}));

vi.mock("@/lib/prisma", () => ({
  hasDatabaseEnv: false,
  prisma: {
    artifact: {
      aggregate: vi.fn(),
    },
  },
}));

import Home from "@/app/page";

describe("Home page", () => {
  beforeEach(() => {
    listTopTags.mockReset();
    listPublicItems.mockReset();

    listTopTags.mockResolvedValue([{ tag: "agents-md", count: 12 }]);
    listPublicItems.mockResolvedValue([
      {
        id: "1",
        slug: "test-agent",
        title: "Test Agent",
        description: "Desc",
        type: "agent",
        tags: ["ai"],
        targets: ["agents-md"],
        hasScopes: true,
        lintGrade: null,
        scopeCount: 1,
        blockCount: 2,
        stats: { views: 10, copies: 2, votes: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  });

  it("renders hero copy and primary CTA", async () => {
    const jsx = await Home();
    render(jsx);

    expect(
      screen.getByRole("heading", { name: /Scan your repo\. See which instructions load\./i })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Scan a folder" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Open Workbench" }).length).toBeGreaterThan(0);
  });
});
