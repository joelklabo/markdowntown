'use client';

import { useEffect, useId, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { CityLogoControls, type CityLogoPreviewWidthMode } from "@/components/wordmark/CityLogoControls";
import { LivingCityWordmarkSvg } from "@/components/wordmark/LivingCityWordmarkSvg";
import { dispatchCityWordmarkEvent } from "@/components/wordmark/sim/events";
import { setCityWordmarkEnginePlaying, setCityWordmarkEngineTimeOfDay } from "@/components/wordmark/sim/engine";
import { useCityWordmarkSim } from "@/components/wordmark/sim/useCityWordmarkSim";

export type CityLogoLabClientProps = {
  snapshotMode?: boolean;
  initialTimeOfDay?: number;
  initialEvent?: "ambulance";
};

export function CityLogoLabClient({ snapshotMode = false, initialTimeOfDay, initialEvent }: CityLogoLabClientProps) {
  const initRef = useRef<true | null>(null);
  if (initRef.current == null) {
    if (snapshotMode) setCityWordmarkEnginePlaying(false);
    if (typeof initialTimeOfDay === "number") setCityWordmarkEngineTimeOfDay(initialTimeOfDay);
    initRef.current = true;
  }

  const sim = useCityWordmarkSim({ enabled: true });
  const id = useId();
  const [previewWidthMode, setPreviewWidthMode] = useState<CityLogoPreviewWidthMode>("fixed");

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
      />

      <div className="space-y-mdt-4">
        <Card className="p-mdt-6">
          <div data-testid="city-logo-preview" className="flex items-center justify-center pb-px md:pb-0">
            <LivingCityWordmarkSvg
              titleId={`${id}-title`}
              descId={`${id}-desc`}
              className={previewWidthMode === "full" ? "w-full h-auto" : "w-full max-w-[1100px] h-auto"}
              seed={sim.config.seed}
              timeOfDay={sim.config.timeOfDay}
              nowMs={sim.nowMs}
              actorRects={sim.actorRects}
              voxelScale={sim.config.render.voxelScale}
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
