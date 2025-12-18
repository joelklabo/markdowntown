type MarkDowntownCityscapeSvgProps = {
  titleId: string;
  descId: string;
  className?: string;
};

const WORDMARK_TEXT = "mark downtown" as const;

type GlyphRow = string;
type Glyph = readonly [GlyphRow, GlyphRow, GlyphRow, GlyphRow, GlyphRow, GlyphRow, GlyphRow];

const GLYPHS: Record<string, Glyph> = {
  m: ["B...B", "BB.BB", "B.B.B", "B...B", "B...B", "B...B", "B...B"],
  a: [".BBB.", "B...B", "B...B", "BBBBB", "B...B", "B...B", "B...B"],
  r: ["BBBB.", "B...B", "B...B", "BBBB.", "B.B..", "B..B.", "B...B"],
  k: ["B...B", "B..B.", "B.B..", "BB...", "B.B..", "B..B.", "B...B"],
  d: ["BBBB.", "B...B", "B...B", "B...B", "B...B", "B...B", "BBBB."],
  o: [".BBB.", "B...B", "B...B", "B...B", "B...B", "B...B", ".BBB."],
  w: ["B...B", "B...B", "B...B", "B.B.B", "B.B.B", "BB.BB", "B...B"],
  n: ["B...B", "BB..B", "B.B.B", "B..BB", "B...B", "B...B", "B...B"],
  t: ["BBBBB", "..B..", "..B..", "..B..", "..B..", "..B..", "..B.."],
};

const GRID_ROWS = 7;
const GRID_COLS = 5;

const CELL = 3; // includes a 1-unit visual gap; matches `shape-rendering: crispEdges`
const BLOCK = 2;
const GLYPH_ADVANCE = GRID_COLS * CELL + 2;
const SPACE_ADVANCE = 10;
const TOP_MARGIN = 7;

function renderGlyphRects(glyph: Glyph, xOffset: number, yOffset: number): Array<JSX.Element> {
  const rects: Array<JSX.Element> = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const line = glyph[row] ?? "";
    for (let col = 0; col < GRID_COLS; col++) {
      const cell = line[col] ?? ".";
      if (cell === ".") continue;

      const x = xOffset + col * CELL;
      const y = yOffset + row * CELL;

      if (cell === "W") {
        rects.push(
          <rect
            key={`w-${xOffset}-${row}-${col}`}
            x={x}
            y={y}
            width={BLOCK}
            height={BLOCK}
            data-mtw="window"
          />
        );
        continue;
      }

      const tone = (row + col) % 4 === 0 ? "building-muted" : "building";
      rects.push(
        <rect
          key={`b-${xOffset}-${row}-${col}`}
          x={x}
          y={y}
          width={BLOCK}
          height={BLOCK}
          data-mtw={tone}
        />
      );
    }
  }
  return rects;
}

export function MarkDowntownCityscapeSvg({ titleId, descId, className }: MarkDowntownCityscapeSvgProps) {
  let width = 0;
  for (const ch of WORDMARK_TEXT) {
    width += ch === " " ? SPACE_ADVANCE : GLYPH_ADVANCE;
  }
  width = Math.max(width - 2, 0);

  const height = TOP_MARGIN + GRID_ROWS * CELL + 1;

  const stars = [
    { x: Math.round(width * 0.18), y: 2 },
    { x: Math.round(width * 0.34), y: 4 },
    { x: Math.round(width * 0.62), y: 3 },
    { x: Math.round(width * 0.78), y: 5 },
  ];

  const moon = { x: Math.round(width * 0.5), y: 1 };

  let xCursor = 0;
  const blocks: Array<JSX.Element> = [];

  for (const ch of WORDMARK_TEXT) {
    if (ch === " ") {
      xCursor += SPACE_ADVANCE;
      continue;
    }
    const glyph = GLYPHS[ch];
    if (!glyph) continue;

    blocks.push(...renderGlyphRects(glyph, xCursor, TOP_MARGIN));
    xCursor += GLYPH_ADVANCE;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descId}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={titleId}>{WORDMARK_TEXT}</title>
      <desc id={descId}>Voxel/cityscape wordmark spelling “{WORDMARK_TEXT}”.</desc>

      {stars.map((star) => (
        <rect key={`${star.x}-${star.y}`} x={star.x} y={star.y} width={1} height={1} data-mtw="star" />
      ))}

      <g data-mtw="moon">
        <rect x={moon.x} y={moon.y} width={2} height={2} />
        <rect x={moon.x + 2} y={moon.y + 1} width={1} height={1} />
        <rect x={moon.x + 1} y={moon.y + 2} width={1} height={1} />
      </g>

      {blocks}
    </svg>
  );
}
