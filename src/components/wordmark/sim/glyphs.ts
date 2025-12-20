import type { CityWordmarkRenderDetail } from "./types";

type GlyphRow = string;

export type CityWordmarkGlyph = readonly GlyphRow[];

export const CITY_WORDMARK_TEXT = "MARKDOWNTOWN" as const;

export const CITY_WORDMARK_GLYPHS = {
  M: ["B...B", "BB.BB", "B.B.B", "B...B", "B...B", "B...B", "B...B"],
  A: [".BBB.", "B...B", "B...B", "BBBBB", "B...B", "B...B", "B...B"],
  R: ["BBBB.", "B...B", "B...B", "BBBB.", "B.B..", "B..B.", "B...B"],
  K: ["B...B", "B..B.", "B.B..", "BB...", "B.B..", "B..B.", "B...B"],
  D: ["BBBB.", "B...B", "B...B", "B...B", "B...B", "B...B", "BBBB."],
  O: [".BBB.", "B...B", "B...B", "B...B", "B...B", "B...B", ".BBB."],
  W: ["B...B", "B...B", "B...B", "B.B.B", "B.B.B", "BB.BB", "B...B"],
  N: ["B...B", "BB..B", "B.B.B", "B..BB", "B...B", "B...B", "B...B"],
  T: ["BBBBB", "..B..", "..B..", "..B..", "..B..", "..B..", "..B.."],
} as const satisfies Record<string, CityWordmarkGlyph>;

export const CITY_WORDMARK_GLYPH_ROWS = 7;
export const CITY_WORDMARK_GLYPH_COLS = 5;

export const CITY_WORDMARK_HD_GLYPHS = {
  M: [
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBBBBB...BBBBBB",
    "BBBBBB...BBBBBB",
    "BBBBBB...BBBBBB",
    "BBB...BBB...BBB",
    "BBB...BBB...BBB",
    "BBB...BBB...BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
  ],
  A: [
    "...BBBBBBBBB...",
    "...BBBBBBBBB...",
    "...BBBBBBBBB...",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBBBBBBBBBBBBBB",
    "BBBBBBBBBBBBBBB",
    "BBBBBBBBBBBBBBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
  ],
  R: [
    "BBBBBBBBBBBB...",
    "BBBBBBBBBBBB...",
    "BBBBBBBBBBBB...",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBBBBBBBBBBB...",
    "BBBBBBBBBBBB...",
    "BBBBBBBBBBBB...",
    "BBB...BBB......",
    "BBB...BBB......",
    "BBB...BBB......",
    "BBB......BBB...",
    "BBB......BBB...",
    "BBB......BBB...",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
  ],
  K: [
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB......BBB...",
    "BBB......BBB...",
    "BBB......BBB...",
    "BBB...BBB......",
    "BBB...BBB......",
    "BBB...BBB......",
    "BBBBBB.........",
    "BBBBBB.........",
    "BBBBBB.........",
    "BBB...BBB......",
    "BBB...BBB......",
    "BBB...BBB......",
    "BBB......BBB...",
    "BBB......BBB...",
    "BBB......BBB...",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
  ],
  D: [
    "BBBBBBBBBBBB...",
    "BBBBBBBBBBBB...",
    "BBBBBBBBBBBB...",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBBBBBBBBBBB...",
    "BBBBBBBBBBBB...",
    "BBBBBBBBBBBB...",
  ],
  O: [
    "...BBBBBBBBB...",
    "...BBBBBBBBB...",
    "...BBBBBBBBB...",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "...BBBBBBBBB...",
    "...BBBBBBBBB...",
    "...BBBBBBBBB...",
  ],
  W: [
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB...BBB...BBB",
    "BBB...BBB...BBB",
    "BBB...BBB...BBB",
    "BBB...BBB...BBB",
    "BBB...BBB...BBB",
    "BBB...BBB...BBB",
    "BBBBBB...BBBBBB",
    "BBBBBB...BBBBBB",
    "BBBBBB...BBBBBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
  ],
  N: [
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBBBBB......BBB",
    "BBBBBB......BBB",
    "BBBBBB......BBB",
    "BBB...BBB...BBB",
    "BBB...BBB...BBB",
    "BBB...BBB...BBB",
    "BBB......BBBBBB",
    "BBB......BBBBBB",
    "BBB......BBBBBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
    "BBB.........BBB",
  ],
  T: [
    "BBBBBBBBBBBBBBB",
    "BBBBBBBBBBBBBBB",
    "BBBBBBBBBBBBBBB",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
    "......BBB......",
  ],
} as const satisfies Record<string, CityWordmarkGlyph>;

export const CITY_WORDMARK_HD_GLYPH_ROWS = 21;
export const CITY_WORDMARK_HD_GLYPH_COLS = 15;

export type CityWordmarkGlyphSet = {
  glyphs: Record<string, CityWordmarkGlyph>;
  rows: number;
  cols: number;
  scale: number;
};

export const CITY_WORDMARK_GLYPH_SETS: Record<CityWordmarkRenderDetail, CityWordmarkGlyphSet> = {
  standard: {
    glyphs: CITY_WORDMARK_GLYPHS,
    rows: CITY_WORDMARK_GLYPH_ROWS,
    cols: CITY_WORDMARK_GLYPH_COLS,
    scale: 1,
  },
  hd: {
    glyphs: CITY_WORDMARK_HD_GLYPHS,
    rows: CITY_WORDMARK_HD_GLYPH_ROWS,
    cols: CITY_WORDMARK_HD_GLYPH_COLS,
    scale: CITY_WORDMARK_HD_GLYPH_COLS / CITY_WORDMARK_GLYPH_COLS,
  },
};

export function getCityWordmarkGlyphSet(detail: CityWordmarkRenderDetail = "standard"): CityWordmarkGlyphSet {
  return CITY_WORDMARK_GLYPH_SETS[detail] ?? CITY_WORDMARK_GLYPH_SETS.standard;
}

export function getCityWordmarkGlyphMetrics(detail: CityWordmarkRenderDetail = "standard") {
  const set = getCityWordmarkGlyphSet(detail);
  return { rows: set.rows, cols: set.cols, scale: set.scale };
}

export function getCityWordmarkGlyph(char: string, detail: CityWordmarkRenderDetail = "standard"): CityWordmarkGlyph {
  const key = char.toUpperCase();
  const { glyphs } = getCityWordmarkGlyphSet(detail);
  const glyph = glyphs[key];
  if (!glyph) {
    throw new Error(`Unknown CityWordmark glyph: "${char}"`);
  }
  return glyph;
}
