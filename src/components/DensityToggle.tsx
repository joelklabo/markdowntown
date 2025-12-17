"use client";

import { useDensity } from "@/providers/DensityProvider";
import { Button } from "./ui/Button";

export function DensityToggle() {
  const { density, toggleDensity } = useDensity();
  const isCompact = density === "compact";

  return (
    <Button
      variant="ghost"
      size="xs"
      type="button"
      aria-pressed={isCompact}
      aria-label={`Switch to ${isCompact ? "comfortable" : "compact"} density`}
      onClick={toggleDensity}
      className="gap-mdt-1"
    >
      <span aria-hidden>↕</span>
      <span>{`Density: ${isCompact ? "Compact" : "Comfortable"}`}</span>
    </Button>
  );
}

