import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteNav } from "@/components/SiteNav";
import { DensityProvider } from "@/providers/DensityProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/library",
}));

describe("SiteNav", () => {
  beforeEach(() => {
    pushMock.mockClear();
    (window.matchMedia as unknown as (query: string) => MediaQueryList) = (query: string) =>
      ({
        matches: query.includes("min-width: 768px"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
  });

  it("renders the BlockTown wordmark", () => {
    render(
      <ThemeProvider>
        <DensityProvider>
          <SiteNav />
        </DensityProvider>
      </ThemeProvider>
    );
    expect(screen.getByRole("link", { name: "BlockTown" })).toBeInTheDocument();
  });

  it("focuses desktop search on / without opening the mobile sheet", () => {
    render(
      <ThemeProvider>
        <DensityProvider>
          <SiteNav />
        </DensityProvider>
      </ThemeProvider>
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "/" }));

    expect(screen.queryByRole("dialog", { name: "Search" })).not.toBeInTheDocument();

    const input = screen.getByPlaceholderText("Search library…");
    expect(document.activeElement).toBe(input);
  });
});
