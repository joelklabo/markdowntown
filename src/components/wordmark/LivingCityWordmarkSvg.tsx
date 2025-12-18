import type { ReactElement } from "react";
import { cn } from "@/lib/cn";
import { clamp01 } from "./sim/easing";
import { CITY_WORDMARK_GLYPH_ROWS } from "./sim/glyphs";
import { createCityWordmarkLayout, createCityWordmarkSkylineMask } from "./sim/layout";
import { getCityWordmarkPalette } from "./sim/palette";
import { getCelestialPositions, getTimeOfDayPhase } from "./sim/time";
import { rgbToCss } from "./sim/renderSvg";

type LivingCityWordmarkSvgProps = {
  titleId: string;
  descId: string;
  className?: string;
  seed?: string;
  /** Normalized time-of-day (0..1). */
  timeOfDay?: number;
};

const ACCESSIBLE_TITLE = "mark downtown";
const VISUAL_WORD = "MARKDOWNTOWN";

function renderCelestialBodyRects(
  x: number,
  y: number,
  size: number,
  kind: "sun" | "moon"
): Array<ReactElement> {
  if (kind === "sun") {
    return [
      <rect key="sun-core" x={x} y={y} width={size} height={size} rx={size / 3} ry={size / 3} />,
      <rect key="sun-ray-1" x={x - size} y={y + size / 3} width={size / 2} height={size / 3} />,
      <rect key="sun-ray-2" x={x + size + size / 2} y={y + size / 3} width={size / 2} height={size / 3} />,
    ];
  }

  return [
    <rect key="moon-core" x={x} y={y} width={size} height={size} rx={size / 3} ry={size / 3} />,
    <rect key="moon-cut" x={x + size / 2} y={y + size / 4} width={size / 2} height={size / 2} opacity={0.35} />,
  ];
}

export function LivingCityWordmarkSvg({
  titleId,
  descId,
  className,
  seed = "markdowntown",
  timeOfDay = 0.78,
}: LivingCityWordmarkSvgProps) {
  const layout = createCityWordmarkLayout();
  const palette = getCityWordmarkPalette(timeOfDay);
  const { daylight } = getTimeOfDayPhase(timeOfDay);
  const nightness = clamp01(1 - daylight);
  const celestial = getCelestialPositions(timeOfDay);

  const SCALE = 3;
  const width = layout.width * SCALE;
  const height = layout.height * SCALE;

  const topPadding = layout.baselineY - CITY_WORDMARK_GLYPH_ROWS;
  const skyHeight = Math.max(1, topPadding) * SCALE;

  const starOpacity = clamp01(nightness * 1.1);
  const stars = [
    { x: Math.round(width * 0.18), y: 2 * SCALE },
    { x: Math.round(width * 0.34), y: 4 * SCALE },
    { x: Math.round(width * 0.62), y: 3 * SCALE },
    { x: Math.round(width * 0.78), y: 5 * SCALE },
  ];

  const skyline = createCityWordmarkSkylineMask({ width: layout.width, baselineY: layout.baselineY, seed });

  const bodySize = 2 * SCALE;
  const skyMaxX = Math.max(0, width - bodySize);
  const skyMaxY = Math.max(0, skyHeight - bodySize);

  const sunX = Math.round(skyMaxX * celestial.sun.x);
  const sunY = Math.round(skyMaxY * (1 - clamp01(celestial.sun.altitude)));
  const moonX = Math.round(skyMaxX * celestial.moon.x);
  const moonY = Math.round(skyMaxY * (1 - clamp01(celestial.moon.altitude)));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("select-none", className)}
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descId}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <title id={titleId}>{ACCESSIBLE_TITLE}</title>
      <desc id={descId}>Living voxel/cityscape wordmark spelling “{VISUAL_WORD}”.</desc>

      <rect x={0} y={0} width={width} height={height} fill={rgbToCss(palette.sky)} />

      {celestial.sun.visible && (
        <g fill={rgbToCss(palette.sun)} opacity={clamp01(daylight * 1.1)}>
          {renderCelestialBodyRects(sunX, sunY, bodySize, "sun")}
        </g>
      )}

      {celestial.moon.visible && (
        <g fill={rgbToCss(palette.moon)} opacity={clamp01(nightness * 1.1)}>
          {renderCelestialBodyRects(moonX, moonY, bodySize, "moon")}
        </g>
      )}

      {stars.map((star) => (
        <rect
          key={`${star.x}-${star.y}`}
          x={star.x}
          y={star.y}
          width={SCALE}
          height={SCALE}
          fill={rgbToCss(palette.star)}
          opacity={starOpacity}
        />
      ))}

      <g fill={rgbToCss(palette.buildingMuted)} opacity={0.9}>
        {skyline.map((r) => (
          <rect
            key={`skyline-${r.x}-${r.y}-${r.width}-${r.height}`}
            x={r.x * SCALE}
            y={r.y * SCALE}
            width={r.width * SCALE}
            height={r.height * SCALE}
          />
        ))}
      </g>

      <g fill={rgbToCss(palette.building)}>
        {layout.rects.map((r) => (
          <rect
            key={`wm-${r.x}-${r.y}-${r.width}-${r.height}`}
            x={r.x * SCALE}
            y={r.y * SCALE}
            width={r.width * SCALE}
            height={r.height * SCALE}
          />
        ))}
      </g>
    </svg>
  );
}
