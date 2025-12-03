import { useMemo } from "react";

type Tier = "micro" | "component" | "panel";

const durations: Record<Tier, string> = {
  micro: "var(--mdt-motion-fast)",
  component: "var(--mdt-motion-base)",
  panel: "var(--mdt-motion-slow)",
};

const distances: Record<Tier, string> = {
  micro: "var(--mdt-motion-distance-short)",
  component: "var(--mdt-motion-distance-mid)",
  panel: "var(--mdt-motion-distance-far)",
};

export type MotionPreset = {
  duration: string;
  easing: string;
  translate: string;
};

export function useMotionPreset(tier: Tier = "component", axis: "x" | "y" = "y"): MotionPreset {
  return useMemo(
    () => ({
      duration: durations[tier],
      easing: "var(--mdt-motion-ease-emphasized)",
      translate: `translate${axis.toUpperCase()}(${distances[tier]})`,
    }),
    [tier, axis]
  );
}
