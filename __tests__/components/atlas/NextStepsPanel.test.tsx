import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NextStepsPanel } from "@/components/atlas/NextStepsPanel";
import type { NextStep } from "@/lib/atlas/simulators/types";

describe("NextStepsPanel", () => {
  it("renders ready steps with actions", async () => {
    const onAction = vi.fn();
    const steps: NextStep[] = [
      {
        id: "ready",
        severity: "ready",
        title: "You're ready to go",
        body: "All required files are in place.",
        primaryAction: { id: "copy-summary", label: "Copy summary" },
        secondaryActions: [{ id: "download-report", label: "Download report" }],
      },
    ];

    render(<NextStepsPanel steps={steps} onAction={onAction} />);

    expect(screen.getByText("Ready")).toBeInTheDocument();
    const copyButton = screen.getByRole("button", { name: "Copy summary" });
    await userEvent.click(copyButton);

    expect(onAction).toHaveBeenCalledWith(steps[0].primaryAction, steps[0]);
  });

  it("renders error steps without actions", () => {
    const steps: NextStep[] = [
      {
        id: "missing-root",
        severity: "error",
        title: "Add the root instruction file",
        body: "This tool needs a root file to load instructions.",
      },
    ];

    render(<NextStepsPanel steps={steps} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Add the root instruction file")).toBeInTheDocument();
  });
});
