import { clamp01 } from "./easing";
import { CITY_WORDMARK_GLYPH_COLS, CITY_WORDMARK_TEXT, getCityWordmarkGlyph } from "./glyphs";
import { createRng } from "./rng";
import { getTimeOfDayPhase } from "./time";

export type CityWordmarkWindow = {
  x: number;
  y: number;
  cycleMs: number;
  phaseMs: number;
  duty: number;
  roll: number;
};

export type CityWordmarkWindowLayoutOptions = {
  seed?: string;
  text?: string;
  topPadding?: number;
  letterSpacing?: number;
  resolution?: number;
  windowChance?: number;
  minCycleMs?: number;
  maxCycleMs?: number;
};

export type CityWordmarkWindowLightsOptions = {
  nowMs: number;
  timeOfDay: number;
  /** 0..1 multiplier for how many windows should be lit at night. */
  intensity?: number;
};

const DEFAULTS = {
  seed: "markdowntown",
  topPadding: 4,
  letterSpacing: 1,
  resolution: 1,
  windowChance: 0.35,
  minCycleMs: 1400,
  maxCycleMs: 5200,
} as const;

export function createCityWordmarkWindows(options: CityWordmarkWindowLayoutOptions = {}): CityWordmarkWindow[] {
  const seed = options.seed ?? DEFAULTS.seed;
  const text = options.text ?? CITY_WORDMARK_TEXT;
  const topPaddingBase = options.topPadding ?? DEFAULTS.topPadding;
  const letterSpacingBase = options.letterSpacing ?? DEFAULTS.letterSpacing;
  const resolution = Math.max(1, Math.floor(options.resolution ?? DEFAULTS.resolution));
  const topPadding = topPaddingBase * resolution;
  const letterSpacing = letterSpacingBase * resolution;
  const windowChanceBase = options.windowChance ?? DEFAULTS.windowChance;
  const windowChance = clamp01(windowChanceBase / resolution);
  const minCycleMs = options.minCycleMs ?? DEFAULTS.minCycleMs;
  const maxCycleMs = options.maxCycleMs ?? DEFAULTS.maxCycleMs;

  if (windowChance < 0 || windowChance > 1) {
    throw new Error("createCityWordmarkWindows: windowChance must be within 0..1");
  }
  if (minCycleMs <= 0 || maxCycleMs <= 0 || maxCycleMs < minCycleMs) {
    throw new Error("createCityWordmarkWindows: invalid cycleMs range");
  }

  const rng = createRng(`${seed}:windows`);

  const windows: CityWordmarkWindow[] = [];

  let xCursor = 0;
  const expandGlyph = (glyph: string[]): string[] => {
    if (resolution === 1) return glyph;
    const out: string[] = [];
    for (const row of glyph) {
      const expandedRow = row
        .split("")
        .map((cell) => cell.repeat(resolution))
        .join("");
      for (let r = 0; r < resolution; r++) out.push(expandedRow);
    }
    return out;
  };

  for (const rawChar of text) {
    if (rawChar === " ") {
      xCursor += letterSpacing * 2;
      continue;
    }

    const glyph = expandGlyph([...getCityWordmarkGlyph(rawChar)]);
    const rowStart = 2 * resolution;
    const rowEnd = 5 * resolution + (resolution - 1);
    const colStart = 1 * resolution;
    const colEnd = 3 * resolution + (resolution - 1);

    for (let row = rowStart; row <= rowEnd; row++) {
      const line = glyph[row] ?? "";
      for (let col = colStart; col <= colEnd; col++) {
        const cell = line[col] ?? ".";
        if (cell === ".") continue;
        if (rng.nextFloat() >= windowChance) continue;

        const cycleMs = rng.nextInt(minCycleMs, maxCycleMs + 1);
        const phaseMs = rng.nextInt(0, cycleMs);
        const duty = clamp01(0.78 + rng.nextFloat() * 0.18);
        const roll = rng.nextFloat();
        windows.push({ x: xCursor + col, y: topPadding + row, cycleMs, phaseMs, duty, roll });
      }
    }

    xCursor += CITY_WORDMARK_GLYPH_COLS * resolution + letterSpacing;
  }

  return windows;
}

export function getCityWordmarkWindowLights(
  windows: readonly CityWordmarkWindow[],
  options: CityWordmarkWindowLightsOptions
): Uint8Array {
  const { daylight } = getTimeOfDayPhase(options.timeOfDay);
  const nightness = clamp01(1 - daylight);
  const intensity = clamp01(options.intensity ?? 1);

  const active = clamp01((nightness - 0.15) / 0.85) * intensity;

  const out = new Uint8Array(windows.length);
  for (let i = 0; i < windows.length; i++) {
    const w = windows[i];
    if (!w) continue;

    const eligible = w.roll < active;
    if (!eligible) continue;

    const t = (options.nowMs + w.phaseMs) % w.cycleMs;
    const on = t < w.cycleMs * w.duty;
    out[i] = on ? 1 : 0;
  }

  return out;
}
