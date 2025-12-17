import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { listAtlasGuideSlugs, loadAtlasGuideMdx } = vi.hoisted(() => ({
  listAtlasGuideSlugs: vi.fn(),
  loadAtlasGuideMdx: vi.fn(),
}));

vi.mock("@/lib/atlas/load", () => ({
  listAtlasGuideSlugs,
  loadAtlasGuideMdx,
}));

const { notFound } = vi.hoisted(() => ({
  notFound: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound,
}));

import AtlasRecipePage from "@/app/atlas/recipes/[slug]/page";

describe("AtlasRecipePage", () => {
  beforeEach(() => {
    listAtlasGuideSlugs.mockReset();
    loadAtlasGuideMdx.mockReset();
    notFound.mockReset();
  });

  it("renders MDX for a known slug", async () => {
    listAtlasGuideSlugs.mockReturnValue(["safe-shell-commands"]);
    loadAtlasGuideMdx.mockReturnValue("# Safe shell commands\n\nHello world.\n");

    const jsx = await AtlasRecipePage({ params: Promise.resolve({ slug: "safe-shell-commands" }) });
    render(jsx);

    expect(screen.getByRole("heading", { name: /safe shell commands/i })).toBeInTheDocument();
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
  });

  it("calls notFound for unknown slug", async () => {
    listAtlasGuideSlugs.mockReturnValue(["safe-shell-commands"]);
    await AtlasRecipePage({ params: Promise.resolve({ slug: "missing" }) });
    expect(notFound).toHaveBeenCalled();
  });
});
