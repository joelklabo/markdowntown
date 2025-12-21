import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SimulatorInsights } from "@/components/atlas/SimulatorInsights";
import type { SimulatorInsights as SimulatorInsightsData } from "@/lib/atlas/simulators/types";

describe("SimulatorInsights summary", () => {
  it("renders summary counts and next steps when files are missing", () => {
    const insights: SimulatorInsightsData = {
      tool: "github-copilot",
      expectedPatterns: [
        {
          id: "copilot-root",
          label: "Repo instructions",
          pattern: ".github/copilot-instructions.md",
        },
        {
          id: "copilot-scoped",
          label: "Scoped instructions",
          pattern: ".github/instructions/*.instructions.md",
        },
      ],
      foundFiles: [".github/copilot-instructions.md"],
      missingFiles: [
        {
          id: "copilot-scoped",
          label: "Scoped instructions",
          pattern: ".github/instructions/*.instructions.md",
        },
      ],
      precedenceNotes: [],
    };

    render(<SimulatorInsights insights={insights} extraFiles={["AGENTS.md"]} />);

    expect(screen.getByText(/Detected tool: GitHub Copilot/i)).toBeInTheDocument();
    expect(screen.getByText(/Found 1 instruction file/i)).toBeInTheDocument();
    expect(screen.getByText(/1 expected file missing/i)).toBeInTheDocument();
    expect(screen.getByText(/1 extra instruction file won't load for this tool/i)).toBeInTheDocument();
    expect(screen.getByText(/Next step: add the missing instruction file/i)).toBeInTheDocument();
  });

  it("renders an empty-state summary when nothing is found", () => {
    const insights: SimulatorInsightsData = {
      tool: "codex-cli",
      expectedPatterns: [
        {
          id: "codex-root",
          label: "Repo instructions",
          pattern: "AGENTS.md",
        },
      ],
      foundFiles: [],
      missingFiles: [
        {
          id: "codex-root",
          label: "Repo instructions",
          pattern: "AGENTS.md",
        },
      ],
      precedenceNotes: [],
    };

    render(<SimulatorInsights insights={insights} extraFiles={[]} />);

    expect(screen.getByText(/Detected tool: Codex CLI/i)).toBeInTheDocument();
    expect(screen.getByText(/No instruction files found/i)).toBeInTheDocument();
    expect(screen.getByText(/1 expected file missing/i)).toBeInTheDocument();
    expect(screen.getByText(/Next step: add the missing instruction file/i)).toBeInTheDocument();
    expect(screen.getByText(/scan was truncated due to file limits/i)).toBeInTheDocument();
  });
});
