import type { CityWordmarkLayout } from "../layout";
import { createRng } from "../rng";
import type { CityWordmarkConfig } from "../types";
import type { CityWordmarkActor, CityWordmarkActorContext, CityWordmarkActorRect, CityWordmarkActorUpdateContext } from "./types";

type AmbulanceState = {
  spawnAtMs: number;
  endAtMs: number;
  x0: number;
  speedVps: number;
  width: number;
  y: number;
  flashPeriodMs: number;
};

function getX(state: AmbulanceState, ctx: { nowMs: number; config: CityWordmarkConfig }): number {
  const elapsedS = Math.max(0, (ctx.nowMs - state.spawnAtMs) / 1000);
  return Math.floor(state.x0 + elapsedS * state.speedVps * ctx.config.timeScale);
}

function createAmbulanceActor(state: AmbulanceState): CityWordmarkActor {
  function update(ctx: CityWordmarkActorUpdateContext): CityWordmarkActor {
    if (!ctx.config.actors.ambulance) return { ...actor, done: true };

    const x = getX(state, ctx);
    const offScreen = x > ctx.layout.sceneWidth + 3;
    const expired = ctx.nowMs >= state.endAtMs;
    if (expired && offScreen) return { ...actor, done: true };
    return actor;
  }

  function render(ctx: { nowMs: number; config: CityWordmarkConfig; layout: CityWordmarkLayout }): CityWordmarkActorRect[] {
    const x = getX(state, ctx);
    if (x > ctx.layout.sceneWidth + 2) return [];
    if (x + state.width < -2) return [];

    const out: CityWordmarkActorRect[] = [
      { x: x + 1, y: state.y, width: state.width - 2, height: 1, tone: "ambulance", opacity: 0.85 },
      { x, y: state.y + 1, width: state.width, height: 1, tone: "ambulance", opacity: 0.95 },
    ];

    const flashT = Math.max(0, ctx.nowMs - state.spawnAtMs);
    const phase = Math.floor(flashT / state.flashPeriodMs) % 2;
    const redOpacity = phase === 0 ? 1 : 0.22;
    const blueOpacity = phase === 1 ? 1 : 0.22;

    out.push(
      { x: x + 2, y: state.y - 1, width: 1, height: 1, tone: "sirenRed", opacity: redOpacity },
      { x: x + 4, y: state.y - 1, width: 1, height: 1, tone: "sirenBlue", opacity: blueOpacity },
      { x: x + state.width, y: state.y + 1, width: 1, height: 1, tone: "headlight", opacity: 1 }
    );

    return out;
  }

  const actor: CityWordmarkActor = {
    kind: "ambulance",
    update,
    render,
  };

  return actor;
}

export function spawnAmbulanceActor(
  ctx: CityWordmarkActorContext & { nowMs: number; triggerIndex: number }
): CityWordmarkActor | null {
  if (!ctx.config.actors.ambulance) return null;

  const rng = createRng(`${ctx.config.seed}:ambulance:${ctx.triggerIndex}`);
  const laneY = Math.max(0, ctx.layout.baselineY - 2);
  const width = 7;
  const speedVps = 7 + rng.nextFloat() * 3;
  const x0 = -width - 2 + rng.nextFloat() * 2;

  return createAmbulanceActor({
    spawnAtMs: ctx.nowMs,
    endAtMs: ctx.nowMs + 9_000,
    x0,
    speedVps,
    width,
    y: laneY,
    flashPeriodMs: 180,
  });
}
