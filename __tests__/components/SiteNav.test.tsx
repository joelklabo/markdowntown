import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { COMMAND_PALETTE_OPEN_EVENT } from "@/components/CommandPalette";
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

  it("renders the mark downtown wordmark", () => {
    render(
      <ThemeProvider>
        <DensityProvider>
          <SiteNav />
        </DensityProvider>
      </ThemeProvider>
    );
    expect(screen.getByRole("link", { name: "mark downtown" })).toBeInTheDocument();
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

  it("marks the active desktop nav link with aria-current", () => {
    render(
      <ThemeProvider>
        <DensityProvider>
          <SiteNav />
        </DensityProvider>
      </ThemeProvider>
    );

    const [desktopNav] = screen.getAllByRole("navigation", { name: "Primary" });
    const desktopLibrary = within(desktopNav).getByRole("link", { name: "Library" });
    const desktopWorkbench = within(desktopNav).getByRole("link", { name: "Workbench" });

    expect(desktopLibrary).toHaveAttribute("aria-current", "page");
    expect(desktopWorkbench).not.toHaveAttribute("aria-current");
  });

  it("dispatches the command palette open event from the desktop trigger", async () => {
    const handler = vi.fn();
    window.addEventListener(COMMAND_PALETTE_OPEN_EVENT, handler as EventListener);

    render(
      <ThemeProvider>
        <DensityProvider>
          <SiteNav />
        </DensityProvider>
      </ThemeProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: /command/i }));

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0]?.[0] as CustomEvent<{ origin?: string }>;
    expect(event.detail?.origin).toBe("desktop_nav_button");

    window.removeEventListener(COMMAND_PALETTE_OPEN_EVENT, handler as EventListener);
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
