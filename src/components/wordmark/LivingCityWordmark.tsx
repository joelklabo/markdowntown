'use client';

import { useId } from "react";
import { usePathname } from "next/navigation";
import { featureFlags } from "@/lib/flags";
import { LivingCityWordmarkSvg } from "./LivingCityWordmarkSvg";
import { useCityWordmarkSim } from "./sim/useCityWordmarkSim";

type LivingCityWordmarkProps = {
  className?: string;
};

export function LivingCityWordmark({ className }: LivingCityWordmarkProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const pathname = usePathname();
  const enabled = featureFlags.wordmarkAnimV1 && pathname !== "/labs/city-logo";
  const sim = useCityWordmarkSim({ enabled });

  return (
    <LivingCityWordmarkSvg
      titleId={titleId}
      descId={descId}
      className={className}
      seed={sim.config.seed}
      timeOfDay={sim.config.timeOfDay}
      scheme={sim.config.scheme}
      nowMs={sim.nowMs}
      actorRects={sim.actorRects}
      voxelScale={sim.config.render.voxelScale}
      skyline={sim.config.skyline}
    />
  );
}
