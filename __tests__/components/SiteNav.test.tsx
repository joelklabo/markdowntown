import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("opens and closes the mobile search sheet with focus restore", async () => {
    (window.matchMedia as unknown as (query: string) => MediaQueryList) = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;

    render(
      <ThemeProvider>
        <DensityProvider>
          <SiteNav />
        </DensityProvider>
      </ThemeProvider>
    );

    const trigger = screen.getByRole("button", { name: "Search", expanded: false });
    await userEvent.click(trigger);

    expect(screen.getByRole("dialog", { name: "Search" })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Search" })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it("opens the overflow sheet and switches to search", async () => {
    (window.matchMedia as unknown as (query: string) => MediaQueryList) = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;

    render(
      <ThemeProvider>
        <DensityProvider>
          <SiteNav />
        </DensityProvider>
      </ThemeProvider>
    );

    const menuTrigger = screen.getByRole("button", { name: "Open menu" });
    await userEvent.click(menuTrigger);

    const menuDialog = screen.getByRole("dialog", { name: "More" });
    expect(menuDialog).toBeInTheDocument();

    await userEvent.click(within(menuDialog).getByRole("button", { name: "Search" }));

    expect(screen.queryByRole("dialog", { name: "More" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Search" })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Search" })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(menuTrigger);
  });
});
