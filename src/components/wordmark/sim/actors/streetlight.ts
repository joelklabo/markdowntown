import { clamp01 } from "../easing";
import type { CityWordmarkLayout } from "../layout";
import { createRng } from "../rng";
import { getTimeOfDayPhase } from "../time";
import type { CityWordmarkConfig } from "../types";
import type { CityWordmarkActor, CityWordmarkActorContext, CityWordmarkActorRect } from "./types";

type Streetlight = {
  x: number;
  y: number;
  flicker: boolean;
  cycleMs: number;
  phaseMs: number;
  dimOpacity: number;
};

type StreetlightState = {
  lights: readonly Streetlight[];
};

function getStreetlightCount(config: CityWordmarkConfig): number {
  if (!config.actors.streetlights) return 0;
  if (config.density === "sparse") return 2;
  if (config.density === "dense") return 6;
  return 4;
}

function createStreetlightActor(state: StreetlightState): CityWordmarkActor {
  function update() {
    return actor;
  }

  function render(ctx: { nowMs: number; config: CityWordmarkConfig; layout: CityWordmarkLayout }): CityWordmarkActorRect[] {
    const { daylight } = getTimeOfDayPhase(ctx.config.timeOfDay);
    const nightness = clamp01(1 - daylight);
    if (nightness <= 0.12) return [];

    const out: CityWordmarkActorRect[] = [];

    for (const light of state.lights) {
      if (light.x < 0 || light.x >= ctx.layout.sceneWidth) continue;
      if (light.y < 0 || light.y >= ctx.layout.height) continue;

      let opacity = 1;
      if (light.flicker) {
        const t = (ctx.nowMs + light.phaseMs) % light.cycleMs;
        opacity = t < 120 ? light.dimOpacity : t < 200 ? 1 : t < 320 ? light.dimOpacity * 0.7 : 1;
      }

      out.push({ x: light.x, y: light.y, width: 1, height: 1, tone: "headlight", opacity });
    }

    return out;
  }

  const actor: CityWordmarkActor = {
    kind: "streetlight",
    update: () => update(),
    render,
  };

  return actor;
}

export function spawnStreetlightActors(ctx: CityWordmarkActorContext): CityWordmarkActor[] {
  const count = getStreetlightCount(ctx.config);
  if (count === 0) return [];
  if (ctx.layout.sceneWidth <= 0) return [];

  const rng = createRng(`${ctx.config.seed}:streetlights`);
  const y = Math.max(0, ctx.layout.baselineY - 3);
  const xMax = Math.max(0, ctx.layout.sceneWidth - 1);

  const lights: Streetlight[] = [];

  for (let i = 0; i < count; i++) {
    const xBase = Math.round(((i + 1) / (count + 1)) * xMax);
    const jitter = rng.nextInt(-1, 2);
    const x = clamp01((xBase + jitter) / Math.max(1, xMax)) * xMax;

    const cycleMs = rng.nextInt(2400, 7200);
    const phaseMs = rng.nextInt(0, cycleMs);
    const flicker = rng.nextFloat() < 0.45;
    const dimOpacity = 0.18 + rng.nextFloat() * 0.22;

    lights.push({
      x: Math.round(x),
      y,
      flicker,
      cycleMs,
      phaseMs,
      dimOpacity,
    });
  }

  return [createStreetlightActor({ lights })];
}
