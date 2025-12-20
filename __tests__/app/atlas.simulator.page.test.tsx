import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AtlasSimulatorPage from "@/app/atlas/simulator/page";

describe("/atlas/simulator page", () => {
  it("renders simulator inputs", () => {
    render(<AtlasSimulatorPage />);
    expect(screen.getByRole("heading", { name: "Simulator" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Inputs" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Result" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tool")).toBeInTheDocument();
    expect(screen.getByLabelText("Current directory (cwd)")).toBeInTheDocument();
    expect(screen.getByLabelText("Repo tree (paths)")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Loaded files" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Actions" })).toBeInTheDocument();
  });
});
