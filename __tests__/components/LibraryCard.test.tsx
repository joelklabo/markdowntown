import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { LibraryCard } from "@/components/LibraryCard";
import type { SampleItem } from "@/lib/sampleContent";

vi.mock("next/link", () => {
  type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode };
  return {
    __esModule: true,
    default: ({ href, children, ...rest }: LinkProps) => (
      <a href={href} {...rest}>
        {children}
      </a>
    ),
  };
});

describe("LibraryCard", () => {
  const item: SampleItem = {
    id: "demo-snippet",
    title: "Snippet demo",
    description: "Test snippet description",
    tags: ["cli", "qa"],
    stats: { copies: 12, views: 34, votes: 5 },
    type: "snippet",
    badge: "trending",
  };

  it("shows metadata and actions for snippet items", () => {
    render(<LibraryCard item={item} />);

    expect(screen.getByText("Snippet")).toBeInTheDocument();
    expect(screen.getByText("Trending")).toBeInTheDocument();
    expect(screen.getByText(/Test snippet description/)).toBeInTheDocument();
    expect(screen.getByText("#cli")).toBeInTheDocument();
    expect(screen.getByText("#qa")).toBeInTheDocument();

    const copyLink = screen.getByText("Copy").closest("a");
    expect(copyLink).toHaveAttribute("href", "/snippets/demo-snippet");

    const addLink = screen.getByText("Add to builder").closest("a");
    expect(addLink).toHaveAttribute("href", "/builder?add=demo-snippet");
  });
});
