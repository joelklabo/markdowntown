import type { Rgb } from "./color";

export function rgbToCss(rgb: Rgb): string {
  return `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
}

