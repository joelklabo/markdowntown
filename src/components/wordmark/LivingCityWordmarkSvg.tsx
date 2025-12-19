'use client';

import type { ReactElement } from "react";
import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { clamp01 } from "./sim/easing";
import type { CityWordmarkActorRect } from "./sim/actors/types";
import { CITY_WORDMARK_GLYPH_ROWS } from "./sim/glyphs";
import { createCityWordmarkLayout, createCityWordmarkSkylineMask } from "./sim/layout";
import { getCityWordmarkPalette } from "./sim/palette";
import { getCelestialPositions, getTimeOfDayPhase } from "./sim/time";
import type { Rgb } from "./sim/color";
import { normalizeVoxelScale, rgbToCss, voxelRectsToPath } from "./sim/renderSvg";
import { createCityWordmarkWindows, getCityWordmarkWindowLights } from "./sim/windowLights";

type LivingCityWordmarkSvgProps = {
  titleId: string;
  descId: string;
  className?: string;
  seed?: string;
  /** Normalized time-of-day (0..1). */
  timeOfDay?: number;
  nowMs?: number;
  actorRects?: readonly CityWordmarkActorRect[];
  /** Integer pixel scale for each voxel (crisp edges). */
  voxelScale?: number;
};

const ACCESSIBLE_TITLE = "mark downtown";
const VISUAL_WORD = "MARKDOWNTOWN";
const SIREN_RED: Rgb = [255, 84, 84];
const SIREN_BLUE: Rgb = [84, 148, 255];

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
  nowMs = 0,
  actorRects = [],
  voxelScale: voxelScaleProp,
}: LivingCityWordmarkSvgProps) {
  const layout = useMemo(() => createCityWordmarkLayout(), []);

  const palette = getCityWordmarkPalette(timeOfDay);
  const { daylight } = getTimeOfDayPhase(timeOfDay);
  const nightness = clamp01(1 - daylight);
  const celestial = getCelestialPositions(timeOfDay);

  const voxelScale = normalizeVoxelScale(voxelScaleProp ?? 3);
  const width = layout.width * voxelScale;
  const height = layout.height * voxelScale;

  const topPadding = layout.baselineY - CITY_WORDMARK_GLYPH_ROWS;
  const skyHeight = Math.max(1, topPadding) * voxelScale;

  const starOpacity = clamp01(nightness * 1.1);
  const stars = [
    { x: Math.round(width * 0.18), y: 2 * voxelScale },
    { x: Math.round(width * 0.34), y: 4 * voxelScale },
    { x: Math.round(width * 0.62), y: 3 * voxelScale },
    { x: Math.round(width * 0.78), y: 5 * voxelScale },
  ];

  const skyline = useMemo(
    () => createCityWordmarkSkylineMask({ width: layout.width, baselineY: layout.baselineY, seed }),
    [layout.baselineY, layout.width, seed]
  );
  const skylinePath = useMemo(() => voxelRectsToPath(skyline, voxelScale), [skyline, voxelScale]);

  const wordmarkPath = useMemo(() => voxelRectsToPath(layout.rects, voxelScale), [layout.rects, voxelScale]);

  const windows = useMemo(() => createCityWordmarkWindows({ seed }), [seed]);
  const windowState = useMemo(
    () => getCityWordmarkWindowLights(windows, { nowMs, timeOfDay }),
    [nowMs, timeOfDay, windows]
  );
  const windowsPath = useMemo(() => {
    const lit: Array<{ x: number; y: number; width: number; height: number }> = [];
    for (let i = 0; i < windows.length; i++) {
      if (!windowState[i]) continue;
      const w = windows[i];
      if (!w) continue;
      lit.push({ x: w.x, y: w.y, width: 1, height: 1 });
    }
    return voxelRectsToPath(lit, voxelScale);
  }, [voxelScale, windowState, windows]);

  const bodySize = 2 * voxelScale;
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
          width={voxelScale}
          height={voxelScale}
          fill={rgbToCss(palette.star)}
          opacity={starOpacity}
        />
      ))}

      <g fill={rgbToCss(palette.buildingMuted)} opacity={0.9}>
        <path d={skylinePath} />
      </g>

      <g fill={rgbToCss(palette.building)}>
        <path d={wordmarkPath} />
      </g>

      <rect
        x={0}
        y={(layout.baselineY - 1) * voxelScale}
        width={width}
        height={voxelScale}
        fill={rgbToCss(palette.buildingMuted)}
        opacity={0.25}
      />

      {windowsPath.length > 0 && (
        <g fill={rgbToCss(palette.window)} opacity={clamp01(nightness * 1.15)}>
          <path d={windowsPath} />
        </g>
      )}

      {actorRects.length > 0 && (
        <g>
          {actorRects.map((r, idx) => {
            let fill: Rgb;
            if (r.tone === "headlight") fill = palette.window;
            else if (r.tone === "ambulance") fill = palette.building;
            else if (r.tone === "pedestrian") fill = palette.building;
            else if (r.tone === "dog") fill = palette.buildingMuted;
            else if (r.tone === "sirenRed") fill = SIREN_RED;
            else if (r.tone === "sirenBlue") fill = SIREN_BLUE;
            else fill = palette.buildingMuted;

            const baseOpacity = r.opacity ?? 1;
            let opacity = baseOpacity;
            if (r.tone === "headlight") opacity *= clamp01(nightness * 1.25);
            if (r.tone === "sirenRed" || r.tone === "sirenBlue") opacity *= clamp01(0.65 + nightness * 0.65);
            return (
              <rect
                key={`actor-${idx}-${r.tone}-${r.x}-${r.y}-${r.width}-${r.height}`}
                x={r.x * voxelScale}
                y={r.y * voxelScale}
                width={r.width * voxelScale}
                height={r.height * voxelScale}
                fill={rgbToCss(fill)}
                opacity={opacity}
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}
