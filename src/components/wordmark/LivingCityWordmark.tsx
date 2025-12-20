'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { featureFlags } from "@/lib/flags";
import { cn } from "@/lib/cn";
import { LivingCityWordmarkSvg } from "./LivingCityWordmarkSvg";
import { createCityWordmarkLayout } from "./sim/layout";
import { useCityWordmarkSim } from "./sim/useCityWordmarkSim";
import { trackError } from "@/lib/analytics";

type LivingCityWordmarkProps = {
  className?: string;
  containerClassName?: string;
  bannerScale?: number;
  preserveAspectRatio?: string;
  sizeMode?: "fixed" | "fluid";
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

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

export function LivingCityWordmark({
  className,
  containerClassName,
  bannerScale,
  preserveAspectRatio,
  sizeMode,
}: LivingCityWordmarkProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const [autoBannerScale, setAutoBannerScale] = useState<number | null>(null);
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isVisualTest =
    typeof window !== "undefined" && (window as { __MDT_VISUAL_TEST__?: boolean }).__MDT_VISUAL_TEST__ === true;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const shouldAnimate =
    featureFlags.wordmarkAnimV1 &&
    featureFlags.wordmarkBannerV1 &&
    !prefersReducedMotion &&
    !isVisualTest &&
    pathname !== "/labs/city-logo";
  const canAnimate = mounted && shouldAnimate;
  const sim = useCityWordmarkSim({ enabled: canAnimate });
  const { peek, setConfig } = sim;
  const baseLayout = useMemo(
    () =>
      createCityWordmarkLayout({
        resolution: sim.config.render.voxelScale,
        detail: sim.config.render.detail,
        sceneScale: 1,
      }),
    [sim.config.render.detail, sim.config.render.voxelScale]
  );

  useEffect(() => {
    if (bannerScale != null) return;
    if (sizeMode !== "fluid") return;
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    let frame = 0;
    const update = (width: number, height: number) => {
      if (width <= 0 || height <= 0) return;
      const targetScale = Math.max(1, Math.ceil((baseLayout.height * (width / height)) / baseLayout.width));
      setAutoBannerScale((prev) => (prev === targetScale ? prev : targetScale));
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => update(width, height));
    });

    observer.observe(el);
    const rect = el.getBoundingClientRect();
    update(rect.width, rect.height);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [bannerScale, baseLayout.height, baseLayout.width, sizeMode]);

  const resolvedBannerScale = bannerScale ?? autoBannerScale ?? sim.config.render.bannerScale;

  useEffect(() => {
    if (!canAnimate) return;
    if (resolvedBannerScale == null) return;
    if (resolvedBannerScale === peek().config.render.bannerScale) return;
    setConfig({ render: { bannerScale: resolvedBannerScale } });
  }, [canAnimate, peek, resolvedBannerScale, setConfig]);

  const mergedClassName = cn(
    "mdt-wordmark",
    canAnimate && "mdt-wordmark--animated",
    className
  );
  const mergedContainerClassName = cn("block h-full w-full", containerClassName);

  const fallback = (
    <span
      className={cn(
        "mdt-wordmark flex items-center justify-center text-caption font-semibold uppercase tracking-[0.35em] text-mdt-muted",
        className
      )}
      aria-label="mark downtown"
    >
      mark downtown
    </span>
  );

  return (
    <WordmarkErrorBoundary
      fallback={fallback}
      onError={(error) =>
        trackError("wordmark_banner_error", error, { route: pathname })
      }
    >
      <span ref={containerRef} className={mergedContainerClassName}>
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
      </span>
    </WordmarkErrorBoundary>
  );
}

type WordmarkErrorBoundaryProps = {
  fallback: React.ReactNode;
  onError?: (error: Error) => void;
  children: React.ReactNode;
};

class WordmarkErrorBoundary extends React.Component<WordmarkErrorBoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
