import type { Rgb } from "./color";
import type { CityWordmarkVoxelRect } from "./layout";

export function rgbToCss(rgb: Rgb): string {
  return `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
}

export function normalizeVoxelScale(scale: number): number {
  if (!Number.isFinite(scale) || scale <= 0) return 1;
  return Math.max(1, Math.floor(scale));
}

function appendRectPath(d: string[], rect: CityWordmarkVoxelRect, scale: number): void {
  const x = rect.x * scale;
  const y = rect.y * scale;
  const w = rect.width * scale;
  const h = rect.height * scale;
  if (w <= 0 || h <= 0) return;
  d.push(`M${x} ${y}h${w}v${h}h-${w}Z`);
}

export function voxelRectsToPath(rects: readonly CityWordmarkVoxelRect[], scale: number = 1): string {
  if (!rects || rects.length === 0) return "";
  const s = normalizeVoxelScale(scale);
  const d: string[] = [];
  for (const rect of rects) appendRectPath(d, rect, s);
  return d.join("");
}
