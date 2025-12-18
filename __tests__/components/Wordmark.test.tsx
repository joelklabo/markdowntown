import { render, screen } from "@testing-library/react";
import { Wordmark } from "@/components/Wordmark";

describe("Wordmark", () => {
  it("renders a link by default", () => {
    render(<Wordmark />);
    expect(screen.getByRole("link", { name: "BlockTown" })).toBeInTheDocument();
    expect(screen.getByTestId("wordmark-motif")).toBeInTheDocument();
  });

  it("can render without a link", () => {
    render(<Wordmark asLink={false} />);
    expect(screen.queryByRole("link", { name: "BlockTown" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("BlockTown")).toBeInTheDocument();
  });

  it("supports size variants", () => {
    render(<Wordmark size="sm" />);
    expect(screen.getByTestId("wordmark")).toHaveClass("text-body-sm");
  });
});

