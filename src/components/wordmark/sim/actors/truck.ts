import { clamp01 } from "../easing";
import type { CityWordmarkLayout } from "../layout";
import { createRng } from "../rng";
import { getTimeOfDayPhase } from "../time";
import type { CityWordmarkConfig } from "../types";
import type { CityWordmarkActor, CityWordmarkActorContext, CityWordmarkActorRect } from "./types";

type TruckState = {
  x0: number;
  speedVps: number;
  width: number;
  cabWidth: number;
  y: number;
};

function getTruckCount(config: CityWordmarkConfig): number {
  if (!config.actors.trucks) return 0;
  if (config.density === "dense") return 2;
  if (config.density === "normal") return 1;
  return 0;
}

function createTruckActor(state: TruckState): CityWordmarkActor {
  function update() {
    return actor;
  }

  function render(ctx: { nowMs: number; config: CityWordmarkConfig; layout: CityWordmarkLayout }): CityWordmarkActorRect[] {
    const period = ctx.layout.width + state.width + 12;
    const x = Math.floor(
      ((state.x0 + (ctx.nowMs / 1000) * state.speedVps * ctx.config.timeScale) % period) - state.width
    );

    if (x > ctx.layout.width + 2) return [];
    if (x + state.width < -2) return [];

    const bodyTone = "car" as const;
    const out: CityWordmarkActorRect[] = [
      // Trailer + cab roof
      { x: x + state.cabWidth, y: state.y, width: state.width - state.cabWidth, height: 1, tone: bodyTone, opacity: 0.82 },
      { x: x + 1, y: state.y, width: state.cabWidth - 1, height: 1, tone: bodyTone, opacity: 0.88 },
      // Body base
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
    kind: "truck",
    update: () => update(),
    render,
  };

  return actor;
}

export function spawnTruckActors(ctx: CityWordmarkActorContext): CityWordmarkActor[] {
  const count = getTruckCount(ctx.config);
  if (count === 0) return [];

  const rng = createRng(`${ctx.config.seed}:trucks`);
  const laneY = Math.max(0, ctx.layout.baselineY - 2);

  const actors: CityWordmarkActor[] = [];
  const width = 10;
  const cabWidth = 4;
  const period = ctx.layout.width + width + 12;
  for (let i = 0; i < count; i++) {
    const speedVps = 2.5 + rng.nextFloat() * 2.5;
    const x0 = (i / count) * period + rng.nextFloat() * 6;
    actors.push(createTruckActor({ x0, speedVps, width, cabWidth, y: laneY }));
  }

  return actors;
}

