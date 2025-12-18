import { describe, expect, it } from "vitest";
import { CITY_WORDMARK_GLYPHS } from "@/components/wordmark/sim/glyphs";
import {
  createCityWordmarkLayout,
  createCityWordmarkSkylineMask,
  getIntegerScaleToFitHeight,
} from "@/components/wordmark/sim/layout";

describe("createCityWordmarkLayout", () => {
  it("generates a deterministic rect layout for the default text", () => {
    const a = createCityWordmarkLayout();
    const b = createCityWordmarkLayout();
    expect(a).toEqual(b);
    expect(a.width).toBeGreaterThan(0);
    expect(a.height).toBeGreaterThan(0);
    expect(a.rects.length).toBeGreaterThan(0);
  });

  it("includes all glyphs needed for MARKDOWNTOWN", () => {
    const required = ["M", "A", "R", "K", "D", "O", "W", "N", "T"] as const;
    for (const ch of required) {
      expect(CITY_WORDMARK_GLYPHS[ch]).toBeDefined();
    }
  });
});

describe("createCityWordmarkSkylineMask", () => {
  it("is deterministic for a given seed", () => {
    const layout = createCityWordmarkLayout();

    const a = createCityWordmarkSkylineMask({ width: layout.width, baselineY: layout.baselineY, seed: "seed" });
    const b = createCityWordmarkSkylineMask({ width: layout.width, baselineY: layout.baselineY, seed: "seed" });
    expect(a).toEqual(b);
  });
});

describe("getIntegerScaleToFitHeight", () => {
  it("returns an integer scale that fits within the target height", () => {
    const layout = createCityWordmarkLayout();
    expect(getIntegerScaleToFitHeight(9, layout.height)).toBe(1);
    expect(getIntegerScaleToFitHeight(100, layout.height)).toBeGreaterThan(1);
  });
});
