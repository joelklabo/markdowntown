import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/ThemeToggle";

const toggleMock = vi.fn();

vi.mock("@/providers/ThemeProvider", () => ({
  __esModule: true,
  useTheme: () => ({ theme: "light", toggle: toggleMock, setTheme: vi.fn() }),
}));

describe("ThemeToggle", () => {
  it("shows light state and toggles on click", async () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: /switch to dark mode/i });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(btn);
    expect(toggleMock).toHaveBeenCalledTimes(1);
  });
});
