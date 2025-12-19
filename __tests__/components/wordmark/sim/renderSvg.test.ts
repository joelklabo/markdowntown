import { describe, expect, it } from "vitest";
import { voxelRectsToPath } from "@/components/wordmark/sim/renderSvg";

describe("voxelRectsToPath", () => {
  it("returns empty string for empty input", () => {
    expect(voxelRectsToPath([], 3)).toBe("");
  });

  it("generates deterministic path data at a given scale", () => {
    const d = voxelRectsToPath(
      [
        { x: 0, y: 0, width: 1, height: 1 },
        { x: 2, y: 0, width: 2, height: 1 },
      ],
      3
    );

    expect(d).toBe("M0 0h3v3h-3ZM6 0h6v3h-6Z");
  });
});

