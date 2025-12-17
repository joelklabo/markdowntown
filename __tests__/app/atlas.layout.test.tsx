import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { listAtlasPlatforms, loadAtlasFacts } = vi.hoisted(() => ({
  listAtlasPlatforms: vi.fn(),
  loadAtlasFacts: vi.fn(),
}));

vi.mock("@/lib/atlas/load", () => ({
  listAtlasPlatforms,
  loadAtlasFacts,
}));

vi.mock("next/link", () => {
  type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  };
  return {
    __esModule: true,
    default: ({ href, children, ...rest }: LinkProps) => (
      <a href={href} {...rest}>
        {children}
      </a>
    ),
  };
});

import AtlasLayout from "@/app/atlas/layout";

describe("AtlasLayout", () => {
  beforeEach(() => {
    listAtlasPlatforms.mockReset();
    loadAtlasFacts.mockReset();

    listAtlasPlatforms.mockReturnValue(["cursor"]);
    loadAtlasFacts.mockReturnValue({ lastVerified: "2025-12-17T00:00:00Z" });
  });

  it("renders sidebar links and header shell", () => {
    render(
      <AtlasLayout>
        <div>Child</div>
      </AtlasLayout>
    );

    expect(screen.getByRole("link", { name: "Platforms" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Concepts" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Recipes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Compare" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Changelog" })).toBeInTheDocument();

    expect(screen.getByRole("searchbox", { name: "Search Atlas" })).toBeInTheDocument();
    expect(screen.getByText("Last updated")).toBeInTheDocument();
    expect(screen.getByText("2025-12-17")).toBeInTheDocument();
  });
});
