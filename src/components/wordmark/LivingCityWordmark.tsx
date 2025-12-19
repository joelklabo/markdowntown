'use client';

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { featureFlags } from "@/lib/flags";
import { LivingCityWordmarkSvg } from "./LivingCityWordmarkSvg";
import { useCityWordmarkSim } from "./sim/useCityWordmarkSim";

type LivingCityWordmarkProps = {
  className?: string;
  bannerScale?: number;
  preserveAspectRatio?: string;
};

export function LivingCityWordmark({ className, bannerScale, preserveAspectRatio }: LivingCityWordmarkProps) {
  const [mounted, setMounted] = useState(false);
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const enabled = mounted && featureFlags.wordmarkAnimV1 && pathname !== "/labs/city-logo";
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
      bannerScale={bannerScale}
      preserveAspectRatio={preserveAspectRatio}
      skyline={sim.config.skyline}
    />
  );
}
