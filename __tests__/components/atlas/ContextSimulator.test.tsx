import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContextSimulator } from "@/components/atlas/ContextSimulator";

vi.mock("@/lib/flags", () => ({
  featureFlags: {
    publicLibrary: false,
    themeRefreshV1: false,
    uxClarityV1: false,
    instructionHealthV1: true,
    wordmarkAnimV1: true,
    wordmarkBannerV1: true,
  },
}));

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
    expect(screen.getByRole("heading", { name: "Scan setup" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Results" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy summary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download report" })).toBeInTheDocument();

    await userEvent.click(screen.getByText(/advanced: paste repo paths/i));
    const manualPathsInput = screen.getByPlaceholderText(/one path per line/i);
    await userEvent.clear(manualPathsInput);
    await userEvent.type(
      manualPathsInput,
      ".github/copilot-instructions.md\n.github/instructions/apps-web.instructions.md\nAGENTS.md\n"
    );

    await userEvent.click(screen.getByRole("button", { name: "Refresh results" }));

    expect(screen.getByRole("heading", { name: "Instruction health" })).toBeInTheDocument();
    expect(screen.getByText("0 errors / 1 warning")).toBeInTheDocument();
    const issuesList = screen.getByRole("list", { name: "Instruction health issues" });
    expect(within(issuesList).getByText(/instruction files for other tools/i)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Content lint" })).toBeInTheDocument();
    expect(screen.getByText("Enable content linting to see results")).toBeInTheDocument();

    const loadedList = screen.getByRole("list", { name: "Loaded files" });
    expect(within(loadedList).getByText(".github/copilot-instructions.md")).toBeInTheDocument();
    expect(within(loadedList).getByText(".github/instructions/apps-web.instructions.md")).toBeInTheDocument();
    expect(within(loadedList).queryByText("AGENTS.md")).not.toBeInTheDocument();
  });

  it("simulates loaded files for Copilot CLI", async () => {
    render(<ContextSimulator />);

    await userEvent.selectOptions(screen.getByLabelText("Tool"), "copilot-cli");

    await userEvent.click(screen.getByText(/advanced: paste repo paths/i));
    const manualPathsInput = screen.getByPlaceholderText(/one path per line/i);
    await userEvent.clear(manualPathsInput);
    await userEvent.type(
      manualPathsInput,
      ".github/copilot-instructions.md\n.github/copilot-instructions/apps-web.instructions.md\n.github/agents/release.agent.md\nAGENTS.md\n"
    );

    await userEvent.click(screen.getByRole("button", { name: "Refresh results" }));

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

    await userEvent.click(screen.getByText(/advanced: paste repo paths/i));
    const manualPathsInput = screen.getByPlaceholderText(/one path per line/i);
    await userEvent.clear(manualPathsInput);
    await userEvent.type(
      manualPathsInput,
      "AGENTS.md\nAGENTS.override.md\npackages/app/AGENTS.md\n"
    );

    await userEvent.click(screen.getByRole("button", { name: "Refresh results" }));

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
    await userEvent.click(screen.getByRole("button", { name: "Scan a folder" }));

    expect(await screen.findByText(/2 file\(s\) scanned.*2 instruction file\(s\) matched/i)).toBeInTheDocument();

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
