import { render } from "@testing-library/react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";

describe("Card", () => {
  it("renders children", () => {
    const { getByText } = render(
      <Card>
        <span>inside</span>
      </Card>
    );
    expect(getByText("inside")).toBeInTheDocument();
  });
});

describe("Pill", () => {
  it("applies tone class", () => {
    const { getByText } = render(<Pill tone="yellow">Alert</Pill>);
    const el = getByText("Alert");
    expect(el.className).toContain("pill-yellow");
  });
});
