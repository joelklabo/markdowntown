import { clamp01 } from "../easing";
import type { CityWordmarkLayout } from "../layout";
import { createRng } from "../rng";
import { getTimeOfDayPhase } from "../time";
import type { CityWordmarkConfig } from "../types";
import type { CityWordmarkActor, CityWordmarkActorContext, CityWordmarkActorRect } from "./types";

type CarState = {
  x0: number;
  speedVps: number;
  width: number;
  y: number;
};

function getCarCount(config: CityWordmarkConfig): number {
  if (!config.actors.cars) return 0;
  if (config.density === "sparse") return 1;
  if (config.density === "dense") return 3;
  return 2;
}

function createCarActor(state: CarState): CityWordmarkActor {
  function update() {
    return actor;
  }

  function render(ctx: { nowMs: number; config: CityWordmarkConfig; layout: CityWordmarkLayout }): CityWordmarkActorRect[] {
    const period = ctx.layout.width + state.width + 8;
    const x = Math.floor(
      ((state.x0 + (ctx.nowMs / 1000) * state.speedVps * ctx.config.timeScale) % period) - state.width
    );

    if (x > ctx.layout.width + 2) return [];
    if (x + state.width < -2) return [];

    const bodyTone = "car" as const;
    const out: CityWordmarkActorRect[] = [
      { x: x + 1, y: state.y, width: state.width - 2, height: 1, tone: bodyTone, opacity: 0.85 },
      { x, y: state.y + 1, width: state.width, height: 1, tone: bodyTone, opacity: 0.95 },
    ];

    const { daylight } = getTimeOfDayPhase(ctx.config.timeOfDay);
    const nightness = clamp01(1 - daylight);
    if (nightness > 0.12) {
      out.push({
        x: x + state.width,
        y: state.y + 1,
        width: 1,
        height: 1,
        tone: "headlight",
        opacity: clamp01(nightness * 0.85),
      });
    }

    return out;
  }

  const actor: CityWordmarkActor = {
    kind: "car",
    update: () => update(),
    render,
  };

  return actor;
}

export function spawnCarActors(ctx: CityWordmarkActorContext): CityWordmarkActor[] {
  const count = getCarCount(ctx.config);
  if (count === 0) return [];

  const rng = createRng(`${ctx.config.seed}:cars`);
  const laneY = Math.max(0, ctx.layout.baselineY - 2);
  const width = 5;

  const actors: CityWordmarkActor[] = [];
  const period = ctx.layout.width + width + 8;
  for (let i = 0; i < count; i++) {
    const speedVps = 3 + rng.nextFloat() * 6;
    const x0 = (i / count) * period + rng.nextFloat() * 4;
    actors.push(createCarActor({ x0, speedVps, width, y: laneY }));
  }

  return actors;
}
