import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommandPalette, COMMAND_PALETTE_OPEN_EVENT } from "@/components/CommandPalette";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useWorkbenchStore } from "@/hooks/useWorkbenchStore";
import { track } from "@/lib/analytics";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/workbench",
}));

vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    act(() => {
      useWorkbenchStore.getState().resetDraft();
    });
  });

  it("renders without crashing", () => {
    render(
      <ThemeProvider>
        <CommandPalette />
      </ThemeProvider>
    );
  });

  it("opens with Ctrl+K", () => {
    render(
      <ThemeProvider>
        <CommandPalette />
      </ThemeProvider>
    );

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.getByPlaceholderText("Type a command or search…")).toBeInTheDocument();
    expect(track).toHaveBeenCalled();
  });

  it("includes key commands when opened", () => {
    render(
      <ThemeProvider>
        <CommandPalette />
      </ThemeProvider>
    );

    act(() => {
      window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_OPEN_EVENT, { detail: { origin: "test" } }));
    });

    expect(screen.getByText("Open workbench")).toBeInTheDocument();
    expect(screen.getByText("Translate (paste)")).toBeInTheDocument();
    expect(screen.getByText("Create new artifact")).toBeInTheDocument();
    expect(screen.getByText("Export zip")).toBeInTheDocument();
  });

  it("opens block picker query with Ctrl+P", () => {
    act(() => {
      const store = useWorkbenchStore.getState();
      store.setUam({
        ...store.uam,
        blocks: [{ id: "b1", scopeId: "global", kind: "markdown", body: "Hello" }],
      });
    });

    render(
      <ThemeProvider>
        <CommandPalette />
      </ThemeProvider>
    );

    fireEvent.keyDown(window, { key: "p", ctrlKey: true });
    const input = screen.getByPlaceholderText("Type a command or search…");
    expect(input).toHaveValue("open block");
    expect(screen.getByText(/Open block:/)).toBeInTheDocument();
  });

  it("marks the draft as saved with Ctrl+S on Workbench", () => {
    render(
      <ThemeProvider>
        <CommandPalette />
      </ThemeProvider>
    );

    expect(useWorkbenchStore.getState().autosaveStatus).toBe("idle");
    fireEvent.keyDown(window, { key: "s", ctrlKey: true });
    expect(useWorkbenchStore.getState().autosaveStatus).toBe("saved");
    expect(useWorkbenchStore.getState().lastSavedAt).not.toBeNull();
    expect(track).toHaveBeenCalledWith("workbench_shortcut", expect.objectContaining({ action: "save_draft" }));
  });

  it("opens export query with Ctrl+Shift+E", () => {
    render(
      <ThemeProvider>
        <CommandPalette />
      </ThemeProvider>
    );

    fireEvent.keyDown(window, { key: "e", ctrlKey: true, shiftKey: true });
    const input = screen.getByPlaceholderText("Type a command or search…");
    expect(input).toHaveValue("export");
  });
});
