'use client';

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { featureFlags } from "@/lib/flags";
import { cn } from "@/lib/cn";
import { LivingCityWordmarkSvg } from "./LivingCityWordmarkSvg";
import { useCityWordmarkSim } from "./sim/useCityWordmarkSim";

type LivingCityWordmarkProps = {
  className?: string;
  bannerScale?: number;
  preserveAspectRatio?: string;
  sizeMode?: "fixed" | "fluid";
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return reduced;
}

export function LivingCityWordmark({ className, bannerScale, preserveAspectRatio, sizeMode }: LivingCityWordmarkProps) {
  const [mounted, setMounted] = useState(false);
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const shouldAnimate =
    featureFlags.wordmarkAnimV1 && !prefersReducedMotion && pathname !== "/labs/city-logo";
  const enabled = mounted && shouldAnimate;
  const sim = useCityWordmarkSim({ enabled });
  const { peek, setConfig } = sim;
  const resolvedBannerScale = bannerScale ?? sim.config.render.bannerScale;

  useEffect(() => {
    if (!enabled) return;
    if (bannerScale == null) return;
    if (bannerScale === peek().config.render.bannerScale) return;
    setConfig({ render: { bannerScale } });
  }, [bannerScale, enabled, peek, setConfig]);

  const mergedClassName = cn(
    "mdt-wordmark",
    shouldAnimate && "mdt-wordmark--animated",
    className
  );

  return (
    <LivingCityWordmarkSvg
      titleId={titleId}
      descId={descId}
      className={mergedClassName}
      seed={sim.config.seed}
      timeOfDay={sim.config.timeOfDay}
      scheme={sim.config.scheme}
      nowMs={sim.nowMs}
      actorRects={sim.actorRects}
      voxelScale={sim.config.render.voxelScale}
      renderDetail={sim.config.render.detail}
      bannerScale={resolvedBannerScale}
      sizeMode={sizeMode}
      preserveAspectRatio={preserveAspectRatio}
      skyline={sim.config.skyline}
    />
  );
}
