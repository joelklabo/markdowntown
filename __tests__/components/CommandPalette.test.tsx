import { render } from "@testing-library/react";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeProvider } from "@/providers/ThemeProvider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("CommandPalette", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider>
        <CommandPalette />
      </ThemeProvider>
    );
  });
});
