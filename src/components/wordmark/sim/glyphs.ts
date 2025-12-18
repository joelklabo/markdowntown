type GlyphRow = string;

export type CityWordmarkGlyph = readonly [GlyphRow, GlyphRow, GlyphRow, GlyphRow, GlyphRow, GlyphRow, GlyphRow];

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

export function getCityWordmarkGlyph(char: string): CityWordmarkGlyph {
  const key = char.toUpperCase();
  const glyph = (CITY_WORDMARK_GLYPHS as Record<string, CityWordmarkGlyph | undefined>)[key];
  if (!glyph) {
    throw new Error(`Unknown CityWordmark glyph: "${char}"`);
  }
  return glyph;
}

