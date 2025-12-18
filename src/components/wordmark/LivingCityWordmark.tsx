'use client';

import { useId } from "react";
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
  const sim = useCityWordmarkSim({ enabled: featureFlags.wordmarkAnimV1 });

  return (
    <LivingCityWordmarkSvg
      titleId={titleId}
      descId={descId}
      className={className}
      seed={sim.config.seed}
      timeOfDay={sim.config.timeOfDay}
      nowMs={sim.nowMs}
      actorRects={sim.actorRects}
    />
  );
}
