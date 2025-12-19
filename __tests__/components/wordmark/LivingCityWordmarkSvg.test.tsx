import { render, screen } from "@testing-library/react";
import { LivingCityWordmarkSvg } from "@/components/wordmark/LivingCityWordmarkSvg";

function parseViewBox(viewBox: string | null): { width: number; height: number } | null {
  if (!viewBox) return null;
  const parts = viewBox.trim().split(/\s+/).map(Number);
  if (parts.length !== 4) return null;
  const [, , width, height] = parts;
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  return { width, height };
}

describe("LivingCityWordmarkSvg", () => {
  it("scales the rendered SVG dimensions with voxelScale", () => {
    const { rerender } = render(<LivingCityWordmarkSvg titleId="title" descId="desc" voxelScale={1} />);

    const svg = screen.getByRole("img", { name: "mark downtown" });
    const width1 = Number(svg.getAttribute("width"));
    const height1 = Number(svg.getAttribute("height"));
    const viewBox1 = parseViewBox(svg.getAttribute("viewBox"));

    expect(width1).toBeGreaterThan(0);
    expect(height1).toBeGreaterThan(0);
    expect(viewBox1).not.toBeNull();
    expect(viewBox1!.width).toBe(width1);
    expect(viewBox1!.height).toBe(height1);

    rerender(<LivingCityWordmarkSvg titleId="title" descId="desc" voxelScale={6} />);

    const width6 = Number(svg.getAttribute("width"));
    const height6 = Number(svg.getAttribute("height"));
    const viewBox6 = parseViewBox(svg.getAttribute("viewBox"));

    expect(width6).toBe(width1 * 6);
    expect(height6).toBe(height1 * 6);
    expect(viewBox6).not.toBeNull();
    expect(viewBox6!.width).toBe(width6);
    expect(viewBox6!.height).toBe(height6);
  });
});

