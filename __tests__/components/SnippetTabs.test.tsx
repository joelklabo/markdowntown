import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { SnippetTabs } from "@/components/snippet/SnippetTabs";

const writeText = vi.fn();

describe("SnippetTabs", () => {
  beforeAll(() => {
    (navigator as unknown as { clipboard: { writeText: typeof writeText } }).clipboard = { writeText };
  });

  beforeEach(() => writeText.mockClear());

  it("switches tabs and copies active content", () => {
    render(<SnippetTabs title="My Snippet" rendered="Rendered body" raw="RAW_CONTENT" />);

    expect(screen.getByText("Rendered body")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /raw/i }));
    expect(screen.getByText("RAW_CONTENT")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /copy raw/i }));
    expect(writeText).toHaveBeenCalledWith("RAW_CONTENT");
  });
});
