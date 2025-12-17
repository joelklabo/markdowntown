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

import AtlasConceptPage from "@/app/atlas/concepts/[slug]/page";

describe("AtlasConceptPage", () => {
  beforeEach(() => {
    listAtlasGuideSlugs.mockReset();
    loadAtlasGuideMdx.mockReset();
    notFound.mockReset();
  });

  it("renders MDX for a known slug", async () => {
    listAtlasGuideSlugs.mockReturnValue(["scoping"]);
    loadAtlasGuideMdx.mockReturnValue("# Scoping\n\nHello world.\n");

    const jsx = await AtlasConceptPage({ params: Promise.resolve({ slug: "scoping" }) });
    render(jsx);

    expect(screen.getByRole("heading", { name: /scoping/i })).toBeInTheDocument();
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
  });

  it("calls notFound for unknown slug", async () => {
    listAtlasGuideSlugs.mockReturnValue(["scoping"]);
    await AtlasConceptPage({ params: Promise.resolve({ slug: "missing" }) });
    expect(notFound).toHaveBeenCalled();
  });
});
