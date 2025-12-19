'use client';

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getDefaultCityWordmarkConfig } from "./sim/config";
import { CITY_WORDMARK_EVENT, dispatchCityWordmarkEvent, listenCityWordmarkEvents } from "./sim/events";
import type { CityWordmarkDensity } from "./sim/types";
import type { CityWordmarkSim } from "./sim/useCityWordmarkSim";

export type CityLogoPreviewWidthMode = "fixed" | "full";

function formatTimeOfDay(timeOfDay: number): string {
  const totalMinutes = Math.round(timeOfDay * 24 * 60) % (24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export type CityLogoControlsProps = {
  sim: CityWordmarkSim;
  eventOrigin?: string;
  preview?: {
    widthMode: CityLogoPreviewWidthMode;
    setWidthMode: (mode: CityLogoPreviewWidthMode) => void;
  };
};

export function CityLogoControls({ sim, eventOrigin = "labs", preview }: CityLogoControlsProps) {
  const [seedDraft, setSeedDraft] = useState(sim.config.seed);
  const [timeScaleDraft, setTimeScaleDraft] = useState(String(sim.config.timeScale));
  const [voxelScaleDraft, setVoxelScaleDraft] = useState(String(sim.config.render.voxelScale));
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  useEffect(() => {
    return listenCityWordmarkEvents((event) => setLastEvent(JSON.stringify(event)));
  }, []);

  const timeLabel = useMemo(() => formatTimeOfDay(sim.config.timeOfDay), [sim.config.timeOfDay]);

  function applyPreset(preset: "day" | "night" | "rush" | "calm") {
    const base = getDefaultCityWordmarkConfig();

    if (preset === "day") {
      const next = { ...base, timeOfDay: 0.55, density: "normal", timeScale: 1 };
      sim.setConfig(next);
      setSeedDraft(next.seed);
      setTimeScaleDraft(String(next.timeScale));
      setVoxelScaleDraft(String(next.render.voxelScale));
      sim.setPlaying(true);
      return;
    }

    if (preset === "night") {
      const next = { ...base, timeOfDay: 0.04, density: "normal", timeScale: 1 };
      sim.setConfig(next);
      setSeedDraft(next.seed);
      setTimeScaleDraft(String(next.timeScale));
      setVoxelScaleDraft(String(next.render.voxelScale));
      sim.setPlaying(true);
      return;
    }

    if (preset === "rush") {
      const next = { ...base, timeOfDay: 0.72, density: "dense", timeScale: 1.6 };
      sim.setConfig(next);
      setSeedDraft(next.seed);
      setTimeScaleDraft(String(next.timeScale));
      setVoxelScaleDraft(String(next.render.voxelScale));
      sim.setPlaying(true);
      return;
    }

    const next = { ...base, timeOfDay: 0.62, density: "sparse", timeScale: 0.7 };
    sim.setConfig(next);
    setSeedDraft(next.seed);
    setTimeScaleDraft(String(next.timeScale));
    setVoxelScaleDraft(String(next.render.voxelScale));
    sim.setPlaying(true);
  }

  return (
    <div className="space-y-mdt-4">
      <Card className="p-mdt-4 space-y-mdt-3">
        <div className="flex items-center justify-between gap-mdt-2">
          <div className="text-body-sm font-medium text-mdt-text">Controls</div>
          <div className="flex items-center gap-mdt-2">
            <Button size="xs" variant="secondary" onClick={() => sim.setPlaying(!sim.playing)}>
              {sim.playing ? "Pause" : "Play"}
            </Button>
            <Button size="xs" variant="ghost" onClick={() => sim.step(1)} disabled={sim.playing}>
              Step
            </Button>
          </div>
        </div>

        <div className="space-y-mdt-2">
          <div className="flex items-center justify-between gap-mdt-2">
            <div className="text-caption text-mdt-muted">Time of day</div>
            <div className="text-caption text-mdt-text tabular-nums">{timeLabel}</div>
          </div>
          <input
            aria-label="Time of day"
            className="w-full accent-[color:var(--mdt-color-primary)]"
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={sim.config.timeOfDay}
            onChange={(e) => sim.setTimeOfDay(clamp(Number(e.target.value), 0, 1))}
          />
        </div>

        <div className="grid grid-cols-2 gap-mdt-3">
          <div className="space-y-mdt-1">
            <div className="text-caption text-mdt-muted">Seed</div>
            <Input
              value={seedDraft}
              onChange={(e) => {
                const next = e.target.value;
                setSeedDraft(next);
                if (next.trim().length > 0) sim.setConfig({ seed: next.trim() });
              }}
            />
          </div>
          <div className="space-y-mdt-1">
            <div className="text-caption text-mdt-muted">Density</div>
            <Select
              value={sim.config.density}
              onChange={(e) => sim.setConfig({ density: e.target.value as CityWordmarkDensity })}
            >
              <option value="sparse">Sparse</option>
              <option value="normal">Normal</option>
              <option value="dense">Dense</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-mdt-3">
          <div className="space-y-mdt-1">
            <div className="text-caption text-mdt-muted">Time scale</div>
            <Input
              type="number"
              inputMode="decimal"
              min={0.1}
              step={0.1}
              value={timeScaleDraft}
              onChange={(e) => {
                const next = e.target.value;
                setTimeScaleDraft(next);
                const parsed = Number(next);
                if (!Number.isFinite(parsed) || parsed <= 0) return;
                sim.setConfig({ timeScale: parsed });
              }}
            />
          </div>
          <div className="space-y-mdt-1">
            <div className="text-caption text-mdt-muted">Actors</div>
            <div className="grid grid-cols-2 gap-x-mdt-3 gap-y-mdt-2">
              <Checkbox checked={sim.config.actors.cars} onChange={(e) => sim.setConfig({ actors: { cars: e.target.checked } })}>
                Cars
              </Checkbox>
              <Checkbox
                checked={sim.config.actors.streetlights}
                onChange={(e) => sim.setConfig({ actors: { streetlights: e.target.checked } })}
              >
                Lights
              </Checkbox>
              <Checkbox
                checked={sim.config.actors.pedestrians}
                onChange={(e) => sim.setConfig({ actors: { pedestrians: e.target.checked } })}
              >
                People
              </Checkbox>
              <Checkbox checked={sim.config.actors.dogs} onChange={(e) => sim.setConfig({ actors: { dogs: e.target.checked } })}>
                Dogs
              </Checkbox>
              <Checkbox
                checked={sim.config.actors.ambulance}
                onChange={(e) => sim.setConfig({ actors: { ambulance: e.target.checked } })}
              >
                Ambulance
              </Checkbox>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-mdt-4 space-y-mdt-3">
        <div className="text-body-sm font-medium text-mdt-text">Presets</div>
        <div className="grid grid-cols-2 gap-mdt-2">
          <Button variant="secondary" onClick={() => applyPreset("day")}>
            Day
          </Button>
          <Button variant="secondary" onClick={() => applyPreset("night")}>
            Night
          </Button>
          <Button variant="secondary" onClick={() => applyPreset("rush")}>
            Rush hour
          </Button>
          <Button variant="secondary" onClick={() => applyPreset("calm")}>
            Calm
          </Button>
        </div>
        <div className="flex items-center justify-between gap-mdt-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const next = getDefaultCityWordmarkConfig();
              sim.setConfig(next);
              setSeedDraft(next.seed);
              setTimeScaleDraft(String(next.timeScale));
              setVoxelScaleDraft(String(next.render.voxelScale));
            }}
          >
            Reset
          </Button>
          <div className="text-caption text-mdt-muted tabular-nums">nowMs: {Math.round(sim.nowMs)}</div>
        </div>
      </Card>

      <Card className="p-mdt-4 space-y-mdt-3">
        <div className="text-body-sm font-medium text-mdt-text">Renderer</div>
        <div className="grid grid-cols-2 gap-mdt-3">
          <div className="space-y-mdt-1">
            <div className="text-caption text-mdt-muted">Voxel scale</div>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={32}
              step={1}
              value={voxelScaleDraft}
              onChange={(e) => {
                const next = e.target.value;
                setVoxelScaleDraft(next);
                const parsed = Math.floor(Number(next));
                if (!Number.isFinite(parsed) || parsed <= 0) return;
                sim.setConfig({ render: { voxelScale: parsed } });
              }}
            />
          </div>

          {preview ? (
            <div className="space-y-mdt-1">
              <div className="text-caption text-mdt-muted">Preview width</div>
              <Select
                value={preview.widthMode}
                onChange={(e) => preview.setWidthMode(e.target.value as CityLogoPreviewWidthMode)}
              >
                <option value="fixed">Fixed</option>
                <option value="full">Full width</option>
              </Select>
            </div>
          ) : (
            <div />
          )}
        </div>
      </Card>

      <Card className="p-mdt-4 space-y-mdt-3">
        <div className="text-body-sm font-medium text-mdt-text">Events</div>
        <div className="grid grid-cols-2 gap-mdt-2">
          <Button variant="secondary" onClick={() => dispatchCityWordmarkEvent({ type: "search", query: "skyline", ts: Date.now() })}>
            Search
          </Button>
          <Button
            variant="secondary"
            onClick={() => dispatchCityWordmarkEvent({ type: "command_palette_open", origin: eventOrigin, ts: Date.now() })}
          >
            Command
          </Button>
          <Button variant="secondary" onClick={() => dispatchCityWordmarkEvent({ type: "publish", kind: "artifact", ts: Date.now() })}>
            Publish
          </Button>
          <Button variant="secondary" onClick={() => dispatchCityWordmarkEvent({ type: "alert", kind: "ambulance", ts: Date.now() })}>
            Ambulance
          </Button>
        </div>
        <div className="text-caption text-mdt-muted">
          Events dispatch to <code className="font-mono">window</code>. Reactions are implemented in follow-up tasks.
        </div>
        <div className="text-caption text-mdt-muted">
          <div>
            Channel: <code className="font-mono">{CITY_WORDMARK_EVENT}</code>
          </div>
          <div className="line-clamp-2">Last: {lastEvent ?? "—"}</div>
        </div>
      </Card>
    </div>
  );
}
