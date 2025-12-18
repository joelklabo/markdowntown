import { getTimeOfDayPhase } from "./time";
import type { Rgb } from "./color";
import { lerpRgb } from "./color";

export type CityWordmarkPalette = {
  sky: Rgb;
  ground: Rgb;
  building: Rgb;
  buildingMuted: Rgb;
  window: Rgb;
  star: Rgb;
  sun: Rgb;
  moon: Rgb;
};

export const CITY_WORDMARK_PALETTE_NIGHT: CityWordmarkPalette = {
  sky: [8, 12, 24],
  ground: [16, 22, 18],
  building: [18, 28, 44],
  buildingMuted: [14, 22, 34],
  window: [255, 198, 86],
  star: [228, 240, 255],
  sun: [255, 180, 90],
  moon: [210, 220, 240],
};

export const CITY_WORDMARK_PALETTE_DAY: CityWordmarkPalette = {
  sky: [135, 206, 235],
  ground: [68, 140, 88],
  building: [64, 92, 116],
  buildingMuted: [80, 110, 140],
  window: [255, 240, 200],
  star: [228, 240, 255],
  sun: [255, 230, 140],
  moon: [210, 220, 240],
};

function lerpPalette(a: CityWordmarkPalette, b: CityWordmarkPalette, t: number): CityWordmarkPalette {
  return {
    sky: lerpRgb(a.sky, b.sky, t),
    ground: lerpRgb(a.ground, b.ground, t),
    building: lerpRgb(a.building, b.building, t),
    buildingMuted: lerpRgb(a.buildingMuted, b.buildingMuted, t),
    window: lerpRgb(a.window, b.window, t),
    star: lerpRgb(a.star, b.star, t),
    sun: lerpRgb(a.sun, b.sun, t),
    moon: lerpRgb(a.moon, b.moon, t),
  };
}

export function getCityWordmarkPalette(timeOfDay: number): CityWordmarkPalette {
  const { daylight } = getTimeOfDayPhase(timeOfDay);
  return lerpPalette(CITY_WORDMARK_PALETTE_NIGHT, CITY_WORDMARK_PALETTE_DAY, daylight);
}

