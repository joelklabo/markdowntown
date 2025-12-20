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
  sizeMode?: "fixed" | "fluid";
};

export function LivingCityWordmark({ className, bannerScale, preserveAspectRatio, sizeMode }: LivingCityWordmarkProps) {
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
  const { peek, setConfig } = sim;
  const resolvedBannerScale = bannerScale ?? sim.config.render.bannerScale;

  useEffect(() => {
    if (bannerScale == null) return;
    if (bannerScale === peek().config.render.bannerScale) return;
    setConfig({ render: { bannerScale } });
  }, [bannerScale, peek, setConfig]);

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
      bannerScale={resolvedBannerScale}
      sizeMode={sizeMode}
      preserveAspectRatio={preserveAspectRatio}
      skyline={sim.config.skyline}
    />
  );
}
