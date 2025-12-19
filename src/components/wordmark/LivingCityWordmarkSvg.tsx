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
import { batchVoxelRectsToPaths, normalizeVoxelScale, rgbToCss, voxelRectsToPath } from "./sim/renderSvg";
import { createCityWordmarkWindows, getCityWordmarkWindowLights } from "./sim/windowLights";
import type { CityWordmarkScheme, CityWordmarkSkylineConfig } from "./sim/types";

type LivingCityWordmarkSvgProps = {
  titleId: string;
  descId: string;
  className?: string;
  seed?: string;
  /** Normalized time-of-day (0..1). */
  timeOfDay?: number;
  scheme?: CityWordmarkScheme;
  nowMs?: number;
  actorRects?: readonly CityWordmarkActorRect[];
  /** Resolution multiplier (higher = smaller voxels). */
  voxelScale?: number;
  /** Multiplier for extra skyline width in voxels. */
  bannerScale?: number;
  preserveAspectRatio?: string;
  skyline?: Partial<CityWordmarkSkylineConfig>;
};

const ACCESSIBLE_TITLE = "mark downtown";
const VISUAL_WORD = "MARKDOWNTOWN";
const SIREN_RED: Rgb = [255, 84, 84];
const SIREN_BLUE: Rgb = [84, 148, 255];
const BASE_VOXEL_PIXEL_SCALE = 3;

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
  scheme = "classic",
  nowMs = 0,
  actorRects = [],
  voxelScale: voxelScaleProp,
  bannerScale: bannerScaleProp,
  preserveAspectRatio,
  skyline: skylineOverrides,
}: LivingCityWordmarkSvgProps) {
  const layout = useMemo(() => createCityWordmarkLayout(), []);

  const palette = getCityWordmarkPalette(timeOfDay, scheme);
  const { daylight } = getTimeOfDayPhase(timeOfDay);
  const nightness = clamp01(1 - daylight);
  const celestial = getCelestialPositions(timeOfDay);

  const resolution = normalizeVoxelScale(voxelScaleProp ?? BASE_VOXEL_PIXEL_SCALE);
  const bannerScale = normalizeVoxelScale(bannerScaleProp ?? 1);
  const frameWidth = layout.width * bannerScale;
  const viewWidth = frameWidth * resolution;
  const viewHeight = layout.height * resolution;
  const pixelWidth = frameWidth * BASE_VOXEL_PIXEL_SCALE;
  const pixelHeight = layout.height * BASE_VOXEL_PIXEL_SCALE;

  const topPadding = layout.baselineY - CITY_WORDMARK_GLYPH_ROWS;
  const skyHeight = Math.max(1, topPadding) * resolution;

  const starOpacity = clamp01(nightness * 1.1);
  const stars = [
    { x: Math.round(viewWidth * 0.18), y: 2 * resolution },
    { x: Math.round(viewWidth * 0.34), y: 4 * resolution },
    { x: Math.round(viewWidth * 0.62), y: 3 * resolution },
    { x: Math.round(viewWidth * 0.78), y: 5 * resolution },
  ];

  const skyline = useMemo(
    () =>
      createCityWordmarkSkylineMask({
        width: frameWidth,
        baselineY: layout.baselineY,
        seed,
        ...skylineOverrides,
      }),
    [frameWidth, layout.baselineY, seed, skylineOverrides]
  );
  const skylinePath = useMemo(() => voxelRectsToPath(skyline, resolution), [skyline, resolution]);

  const wordmarkPath = useMemo(() => voxelRectsToPath(layout.rects, resolution), [layout.rects, resolution]);

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
    return voxelRectsToPath(lit, resolution);
  }, [resolution, windowState, windows]);

  const bodySize = 2 * resolution;
  const skyMaxX = Math.max(0, viewWidth - bodySize);
  const skyMaxY = Math.max(0, skyHeight - bodySize);

  const sunX = Math.round(skyMaxX * celestial.sun.x);
  const sunY = Math.round(skyMaxY * (1 - clamp01(celestial.sun.altitude)));
  const moonX = Math.round(skyMaxX * celestial.moon.x);
  const moonY = Math.round(skyMaxY * (1 - clamp01(celestial.moon.altitude)));

  const actorBatches = useMemo(
    () =>
      batchVoxelRectsToPaths(actorRects, {
        scale: resolution,
        getGroup: (rect) => {
          let fill: Rgb;
          if (rect.tone === "headlight") fill = palette.window;
          else if (rect.tone === "car") fill = palette.car;
          else if (rect.tone === "ambulance") fill = palette.building;
          else if (rect.tone === "pedestrian") fill = palette.building;
          else if (rect.tone === "dog") fill = palette.buildingMuted;
          else if (rect.tone === "sirenRed") fill = SIREN_RED;
          else if (rect.tone === "sirenBlue") fill = SIREN_BLUE;
          else fill = palette.buildingMuted;

          const baseOpacity = rect.opacity ?? 1;
          let opacity = baseOpacity;
          if (rect.tone === "headlight") opacity *= clamp01(nightness * 1.25);
          if (rect.tone === "sirenRed" || rect.tone === "sirenBlue") opacity *= clamp01(0.65 + nightness * 0.65);
          if (!Number.isFinite(opacity) || opacity <= 0) return null;

          const fillCss = rgbToCss(fill);
          return {
            key: `${rect.tone}-${fillCss}-${opacity}`,
            meta: { fillCss, opacity },
          };
        },
      }),
    [actorRects, nightness, palette, resolution]
  );

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      className={cn("select-none", className)}
      width={pixelWidth}
      height={pixelHeight}
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descId}
      preserveAspectRatio={preserveAspectRatio}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <title id={titleId}>{ACCESSIBLE_TITLE}</title>
      <desc id={descId}>Living voxel/cityscape wordmark spelling “{VISUAL_WORD}”.</desc>

      <rect x={0} y={0} width={viewWidth} height={viewHeight} fill={rgbToCss(palette.sky)} />

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
          width={resolution}
          height={resolution}
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
        y={(layout.baselineY - 1) * resolution}
        width={viewWidth}
        height={resolution}
        fill={rgbToCss(palette.buildingMuted)}
        opacity={0.25}
      />

      {windowsPath.length > 0 && (
        <g fill={rgbToCss(palette.window)} opacity={clamp01(nightness * 1.15)}>
          <path d={windowsPath} />
        </g>
      )}

      {actorBatches.length > 0 && (
        <g>
          {actorBatches.map((batch) => (
            <path key={batch.key} d={batch.d} fill={batch.meta.fillCss} opacity={batch.meta.opacity} />
          ))}
        </g>
      )}
    </svg>
  );
}
