import { render, screen } from "@testing-library/react";
import { BrandLogo } from "@/components/BrandLogo";

describe("BrandLogo", () => {
  it("renders wordmark by default", () => {
    render(<BrandLogo />);
    expect(screen.getByText(/MarkdownTown/)).toBeInTheDocument();
    const img = screen.getByRole("img", { name: /logo/i });
    expect(img).toHaveAttribute("src");
  });

  it("can hide the wordmark", () => {
    render(<BrandLogo showWordmark={false} />);
    expect(screen.queryByText(/MarkdownTown/)).not.toBeInTheDocument();
  });
});
