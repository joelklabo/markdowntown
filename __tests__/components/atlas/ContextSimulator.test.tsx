import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ContextSimulator } from "@/components/atlas/ContextSimulator";

type MockHandle = {
  kind: "file" | "directory";
  name: string;
  entries?: () => AsyncIterable<[string, MockHandle]>;
};

function file(name: string): MockHandle {
  return { kind: "file", name };
}

function dir(name: string, children: MockHandle[]): MockHandle {
  return {
    kind: "directory",
    name,
    async *entries() {
      for (const child of children) {
        yield [child.name, child];
      }
    },
  };
}

describe("ContextSimulator", () => {
  it("simulates loaded files for GitHub Copilot", async () => {
    render(<ContextSimulator />);

    await userEvent.clear(screen.getByLabelText("Repo tree (paths)"));
    await userEvent.type(
      screen.getByLabelText("Repo tree (paths)"),
      ".github/copilot-instructions.md\n.github/instructions/apps-web.instructions.md\nAGENTS.md\n"
    );

    await userEvent.click(screen.getByRole("button", { name: "Simulate" }));

    const loadedList = screen.getByRole("list", { name: "Loaded files" });
    expect(within(loadedList).getByText(".github/copilot-instructions.md")).toBeInTheDocument();
    expect(within(loadedList).getByText(".github/instructions/apps-web.instructions.md")).toBeInTheDocument();
    expect(within(loadedList).queryByText("AGENTS.md")).not.toBeInTheDocument();
  });

  it("simulates loaded files for Copilot CLI", async () => {
    render(<ContextSimulator />);

    await userEvent.selectOptions(screen.getByLabelText("Tool"), "copilot-cli");

    await userEvent.clear(screen.getByLabelText("Repo tree (paths)"));
    await userEvent.type(
      screen.getByLabelText("Repo tree (paths)"),
      ".github/copilot-instructions.md\n.github/copilot-instructions/apps-web.instructions.md\n.github/agents/release.agent.md\nAGENTS.md\n"
    );

    await userEvent.click(screen.getByRole("button", { name: "Simulate" }));

    const loadedList = screen.getByRole("list", { name: "Loaded files" });
    expect(within(loadedList).getByText(".github/copilot-instructions.md")).toBeInTheDocument();
    expect(within(loadedList).getByText(".github/copilot-instructions/apps-web.instructions.md")).toBeInTheDocument();
    expect(within(loadedList).getByText(".github/agents/release.agent.md")).toBeInTheDocument();
    expect(within(loadedList).queryByText("AGENTS.md")).not.toBeInTheDocument();
  });

  it("simulates ordered loaded files for Codex CLI with cwd ancestry", async () => {
    render(<ContextSimulator />);

    await userEvent.selectOptions(screen.getByLabelText("Tool"), "codex-cli");
    await userEvent.clear(screen.getByLabelText("Current directory (cwd)"));
    await userEvent.type(screen.getByLabelText("Current directory (cwd)"), "packages/app");

    await userEvent.clear(screen.getByLabelText("Repo tree (paths)"));
    await userEvent.type(
      screen.getByLabelText("Repo tree (paths)"),
      "AGENTS.md\nAGENTS.override.md\npackages/app/AGENTS.md\n"
    );

    await userEvent.click(screen.getByRole("button", { name: "Simulate" }));

    const loadedList = screen.getByRole("list", { name: "Loaded files" });
    const items = within(loadedList).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining("AGENTS.md"),
      expect.stringContaining("AGENTS.override.md"),
      expect.stringContaining("packages/app/AGENTS.md"),
    ]);
  });

  it("supports folder scans and shows scan metadata + insights", async () => {
    const rootHandle = dir("repo", [file("AGENTS.md"), dir("apps", [dir("web", [file("AGENTS.md")])])]);
    const originalPicker = (window as unknown as { showDirectoryPicker?: () => Promise<unknown> }).showDirectoryPicker;

    Object.defineProperty(window, "showDirectoryPicker", {
      value: async () => rootHandle,
      configurable: true,
    });

    render(<ContextSimulator />);

    await userEvent.selectOptions(screen.getByLabelText("Tool"), "codex-cli");
    await userEvent.clear(screen.getByLabelText("Current directory (cwd)"));
    await userEvent.type(screen.getByLabelText("Current directory (cwd)"), "apps/web");
    await userEvent.click(screen.getByLabelText("Local folder (File System Access API)"));
    await userEvent.click(screen.getByRole("button", { name: "Choose folder" }));

    expect(await screen.findByText(/2 file\(s\) scanned/i)).toBeInTheDocument();

    const loadedList = await screen.findByRole("list", { name: "Loaded files" });
    expect(within(loadedList).getByText("AGENTS.md")).toBeInTheDocument();
    expect(within(loadedList).getByText("apps/web/AGENTS.md")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Insights" })).toBeInTheDocument();
    expect(screen.getByText("Missing instruction files")).toBeInTheDocument();
    expect(screen.getAllByText("AGENTS.override.md").length).toBeGreaterThan(0);

    if (originalPicker) {
      Object.defineProperty(window, "showDirectoryPicker", {
        value: originalPicker,
        configurable: true,
      });
    } else {
      // @ts-expect-error remove the stub when not present
      delete window.showDirectoryPicker;
    }
  });
});
