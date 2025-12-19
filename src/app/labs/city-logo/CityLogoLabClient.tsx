'use client';

import { useCallback, useEffect, useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { CityLogoControls, type CityLogoPreviewWidthMode } from "@/components/wordmark/CityLogoControls";
import { LivingCityWordmarkSvg } from "@/components/wordmark/LivingCityWordmarkSvg";
import { getDefaultCityWordmarkConfig } from "@/components/wordmark/sim/config";
import { dispatchCityWordmarkEvent } from "@/components/wordmark/sim/events";
import { createCityWordmarkEngine } from "@/components/wordmark/sim/engine";
import type { CityWordmarkConfig } from "@/components/wordmark/sim/types";
import { useCityWordmarkSim } from "@/components/wordmark/sim/useCityWordmarkSim";

export type CityLogoLabClientProps = {
  snapshotMode?: boolean;
  initialConfig: CityWordmarkConfig;
  initialPreviewWidthMode?: CityLogoPreviewWidthMode;
  initialPlaying?: boolean;
  initialEvent?: "ambulance";
};

const DEFAULT_CONFIG = getDefaultCityWordmarkConfig();

function formatFloat(value: number, digits: number): string {
  return Number(value.toFixed(digits)).toString();
}

function formatBool(value: boolean): string {
  return value ? "1" : "0";
}

function buildCityLogoLabSearchParams(options: {
  config: CityWordmarkConfig;
  shareTimeOfDay: number;
  previewWidthMode: CityLogoPreviewWidthMode;
  playing: boolean;
}): URLSearchParams {
  const params = new URLSearchParams();
  const { config, shareTimeOfDay, previewWidthMode, playing } = options;

  if (config.seed !== DEFAULT_CONFIG.seed) params.set("seed", config.seed);
  if (config.density !== DEFAULT_CONFIG.density) params.set("density", config.density);
  if (config.scheme !== DEFAULT_CONFIG.scheme) params.set("scheme", config.scheme);
  if (Math.abs(config.timeScale - DEFAULT_CONFIG.timeScale) > 0.0001) params.set("timeScale", formatFloat(config.timeScale, 2));
  if (Math.abs(shareTimeOfDay - DEFAULT_CONFIG.timeOfDay) > 0.0001) params.set("timeOfDay", formatFloat(shareTimeOfDay, 3));

  if (config.render.voxelScale !== DEFAULT_CONFIG.render.voxelScale) params.set("voxelScale", String(config.render.voxelScale));

  if (config.skyline.minHeight !== DEFAULT_CONFIG.skyline.minHeight) params.set("skyMinH", String(config.skyline.minHeight));
  if (config.skyline.maxHeight !== DEFAULT_CONFIG.skyline.maxHeight) params.set("skyMaxH", String(config.skyline.maxHeight));
  if (config.skyline.minSegmentWidth !== DEFAULT_CONFIG.skyline.minSegmentWidth) {
    params.set("skyMinW", String(config.skyline.minSegmentWidth));
  }
  if (config.skyline.maxSegmentWidth !== DEFAULT_CONFIG.skyline.maxSegmentWidth) {
    params.set("skyMaxW", String(config.skyline.maxSegmentWidth));
  }

  if (config.actors.cars !== DEFAULT_CONFIG.actors.cars) params.set("aCars", formatBool(config.actors.cars));
  if (config.actors.trucks !== DEFAULT_CONFIG.actors.trucks) params.set("aTrucks", formatBool(config.actors.trucks));
  if (config.actors.streetlights !== DEFAULT_CONFIG.actors.streetlights) params.set("aStreetlights", formatBool(config.actors.streetlights));
  if (config.actors.pedestrians !== DEFAULT_CONFIG.actors.pedestrians) params.set("aPedestrians", formatBool(config.actors.pedestrians));
  if (config.actors.dogs !== DEFAULT_CONFIG.actors.dogs) params.set("aDogs", formatBool(config.actors.dogs));
  if (config.actors.ambulance !== DEFAULT_CONFIG.actors.ambulance) params.set("aAmbulance", formatBool(config.actors.ambulance));

  if (previewWidthMode !== "fixed") params.set("previewWidth", previewWidthMode);
  if (!playing) params.set("play", "0");

  return params;
}

export function CityLogoLabClient({
  snapshotMode = false,
  initialConfig,
  initialPreviewWidthMode,
  initialPlaying,
  initialEvent,
}: CityLogoLabClientProps) {
  const [engine] = useState(() =>
    createCityWordmarkEngine({
      initialConfig,
      initialPlaying: snapshotMode ? false : (initialPlaying ?? true),
    })
  );

  const sim = useCityWordmarkSim({ enabled: true, engine });
  const id = useId();
  const [previewWidthMode, setPreviewWidthMode] = useState<CityLogoPreviewWidthMode>(initialPreviewWidthMode ?? "fixed");
  const [shareTimeOfDay, setShareTimeOfDay] = useState(() => initialConfig.timeOfDay);
  const shareQuery = buildCityLogoLabSearchParams({
    config: sim.config,
    shareTimeOfDay,
    previewWidthMode,
    playing: sim.playing,
  }).toString();

  useEffect(() => {
    if (snapshotMode) return;

    const handle = window.setTimeout(() => {
      const base = window.location.pathname;
      const next = shareQuery ? `${base}?${shareQuery}` : base;
      const current = window.location.pathname + window.location.search;
      if (next === current) return;
      window.history.replaceState(null, "", next);
    }, 250);

    return () => window.clearTimeout(handle);
  }, [shareQuery, snapshotMode]);

  const copyLink = useCallback(async () => {
    const url = new URL(window.location.href);
    url.search = shareQuery ? `?${shareQuery}` : "";
    const text = url.toString();

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("Copy link:", text);
    }
  }, [shareQuery]);

  useEffect(() => {
    if (initialEvent !== "ambulance") return;
    dispatchCityWordmarkEvent({ type: "alert", kind: "ambulance", ts: Date.now() });
  }, [initialEvent]);

  return (
    <div className="p-mdt-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-mdt-6">
      <CityLogoControls
        sim={sim}
        eventOrigin="labs"
        preview={{ widthMode: previewWidthMode, setWidthMode: setPreviewWidthMode }}
        share={{ onCopyLink: copyLink, onShareTimeOfDay: setShareTimeOfDay }}
      />

      <div className="space-y-mdt-4">
        <Card className="p-mdt-6">
          <div data-testid="city-logo-preview" className="flex items-center justify-center pb-px md:pb-0">
            <LivingCityWordmarkSvg
              titleId={`${id}-title`}
              descId={`${id}-desc`}
              className={previewWidthMode === "full" ? "w-full h-auto" : "max-w-[1100px] h-auto !w-auto"}
              seed={sim.config.seed}
              timeOfDay={sim.config.timeOfDay}
              scheme={sim.config.scheme}
              nowMs={sim.nowMs}
              actorRects={sim.actorRects}
              voxelScale={sim.config.render.voxelScale}
              skyline={sim.config.skyline}
            />
          </div>
        </Card>

        <Card className="p-mdt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-mdt-3 text-caption text-mdt-muted">
            <div className="space-y-1">
              <div className="text-mdt-muted">Seed</div>
              <div className="text-mdt-text font-mono break-all">{sim.config.seed}</div>
            </div>
            <div className="space-y-1">
              <div className="text-mdt-muted">Density</div>
              <div className="text-mdt-text">{sim.config.density}</div>
            </div>
            <div className="space-y-1">
              <div className="text-mdt-muted">Time scale</div>
              <div className="text-mdt-text tabular-nums">{sim.config.timeScale.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-mdt-muted">Actor rects</div>
              <div className="text-mdt-text tabular-nums">{sim.actorRects.length}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
