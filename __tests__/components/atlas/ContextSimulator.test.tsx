import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ContextSimulator } from "@/components/atlas/ContextSimulator";

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
});
