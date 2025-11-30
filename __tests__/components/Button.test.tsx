import { render } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Button", () => {
  it("applies variant classes", () => {
    const { getByText } = render(<Button>Primary</Button>);
    expect(getByText("Primary").className).toContain("bg-mdt-blue");
  });

  it("supports asChild", () => {
    const { getByText } = render(
      <Button asChild>
        <Link href="/test">Go</Link>
      </Button>
    );
    const el = getByText("Go");
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("href")).toBe("/test");
  });
});
