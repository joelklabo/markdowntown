import { describe, expect, it } from "vitest";
import {
  CITY_WORDMARK_PALETTE_DAY,
  CITY_WORDMARK_PALETTE_NIGHT,
  getCityWordmarkPalette,
} from "@/components/wordmark/sim/palette";

describe("getCityWordmarkPalette", () => {
  it("returns night palette at midnight", () => {
    expect(getCityWordmarkPalette(0)).toEqual(CITY_WORDMARK_PALETTE_NIGHT);
  });

  it("returns day palette at noon", () => {
    expect(getCityWordmarkPalette(0.5)).toEqual(CITY_WORDMARK_PALETTE_DAY);
  });

  it("interpolates at sunrise/sunset (midpoint)", () => {
    expect(getCityWordmarkPalette(0.25)).toEqual({
      sky: [72, 109, 130],
      ground: [42, 81, 53],
      building: [41, 60, 80],
      buildingMuted: [47, 66, 87],
      window: [255, 219, 143],
      star: [228, 240, 255],
      sun: [255, 205, 115],
      moon: [210, 220, 240],
    });

    expect(getCityWordmarkPalette(0.75)).toEqual({
      sky: [72, 109, 130],
      ground: [42, 81, 53],
      building: [41, 60, 80],
      buildingMuted: [47, 66, 87],
      window: [255, 219, 143],
      star: [228, 240, 255],
      sun: [255, 205, 115],
      moon: [210, 220, 240],
    });
  });
});

