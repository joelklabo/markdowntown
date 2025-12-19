import type { CityWordmarkConfig } from "./types";
import { getDefaultCityWordmarkConfig, mergeCityWordmarkConfig } from "./config";
import type { CityWordmarkActor, CityWordmarkActorRect } from "./actors/types";
import { spawnCarActors } from "./actors/car";
import { spawnAmbulanceActor } from "./actors/ambulance";
import { spawnStreetlightActors } from "./actors/streetlight";
import { createCityWordmarkLayout } from "./layout";
import { normalizeTimeOfDay } from "./time";
import { listenCityWordmarkEvents } from "./events";
import type { CityWordmarkEvent } from "./types";

export type CityWordmarkEngineListener = () => void;

export type CityWordmarkEngineSnapshot = Readonly<{
  nowMs: number;
  playing: boolean;
  config: CityWordmarkConfig;
  actorRects: readonly CityWordmarkActorRect[];
}>;

const FIXED_STEP_MS = 50;
const DAY_CYCLE_MS = 240_000;
const MAX_FRAME_MS = 250;

const listeners = new Set<CityWordmarkEngineListener>();

const layout = createCityWordmarkLayout();
let actors: CityWordmarkActor[] = [];

let snapshot: CityWordmarkEngineSnapshot = {
  nowMs: 0,
  playing: true,
  config: getDefaultCityWordmarkConfig(),
  actorRects: [],
};

actors = [...spawnCarActors({ config: snapshot.config, layout }), ...spawnStreetlightActors({ config: snapshot.config, layout })];
snapshot = {
  ...snapshot,
  actorRects: actors.flatMap((actor) => actor.render({ nowMs: snapshot.nowMs, config: snapshot.config, layout })),
};

type FrameHandle = number | ReturnType<typeof setTimeout>;

let handle: FrameHandle | null = null;
let lastFrameMs: number | null = null;
let accumulatorMs = 0;
let unsubscribeEvents: (() => void) | null = null;
let ambulanceTriggerIndex = 0;

function emit() {
  for (const listener of listeners) listener();
}

function requestFrame(cb: (ts: number) => void): FrameHandle {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(cb);
  }
  return setTimeout(() => cb(Date.now()), 16);
}

function cancelFrame(id: FrameHandle) {
  if (typeof cancelAnimationFrame === "function" && typeof id === "number") {
    cancelAnimationFrame(id);
    return;
  }
  clearTimeout(id as ReturnType<typeof setTimeout>);
}

function stop() {
  if (!handle) return;
  cancelFrame(handle);
  handle = null;
  lastFrameMs = null;
  accumulatorMs = 0;
}

function maybeStart() {
  if (handle) return;
  if (!snapshot.playing) return;
  if (listeners.size === 0) return;
  handle = requestFrame(onFrame);
}

function maybeStop() {
  if (listeners.size !== 0 && snapshot.playing) return;
  stop();
}

function ensureEventListener() {
  if (unsubscribeEvents) return;
  unsubscribeEvents = listenCityWordmarkEvents(onCityWordmarkEvent);
}

function maybeStopEventListener() {
  if (!unsubscribeEvents) return;
  if (listeners.size !== 0) return;
  unsubscribeEvents();
  unsubscribeEvents = null;
}

function onCityWordmarkEvent(event: CityWordmarkEvent) {
  if (event.type !== "alert" || event.kind !== "ambulance") return;
  if (!snapshot.config.actors.ambulance) return;

  const actor = spawnAmbulanceActor({
    config: snapshot.config,
    layout,
    nowMs: snapshot.nowMs,
    triggerIndex: ambulanceTriggerIndex++,
  });
  if (!actor) return;

  actors = [...actors.filter((a) => a.kind !== "ambulance"), actor];
  const actorRects = actors.flatMap((a) => a.render({ nowMs: snapshot.nowMs, config: snapshot.config, layout }));
  snapshot = { ...snapshot, actorRects };
  emit();
}

function advance(stepMs: number) {
  const nextNowMs = snapshot.nowMs + stepMs;
  const nextTimeOfDay = normalizeTimeOfDay(
    snapshot.config.timeOfDay + (stepMs * snapshot.config.timeScale) / DAY_CYCLE_MS
  );

  const nextConfig = {
    ...snapshot.config,
    timeOfDay: nextTimeOfDay,
  };

  const updateCtx = { nowMs: nextNowMs, dtMs: stepMs, config: nextConfig, layout };
  actors = actors.map((actor) => actor.update(updateCtx)).filter((actor) => !actor.done);
  const actorRects = actors.flatMap((actor) => actor.render({ nowMs: nextNowMs, config: nextConfig, layout }));

  snapshot = {
    ...snapshot,
    nowMs: nextNowMs,
    config: nextConfig,
    actorRects,
  };
}

function onFrame(now: number) {
  if (!snapshot.playing || listeners.size === 0) {
    stop();
    return;
  }

  if (lastFrameMs == null) lastFrameMs = now;
  const frameDelta = Math.min(MAX_FRAME_MS, Math.max(0, now - lastFrameMs));
  lastFrameMs = now;
  accumulatorMs += frameDelta;

  const steps = Math.floor(accumulatorMs / FIXED_STEP_MS);
  if (steps > 0) {
    const stepMs = steps * FIXED_STEP_MS;
    accumulatorMs -= stepMs;
    advance(stepMs);
    emit();
  }

  handle = requestFrame(onFrame);
}

export function getCityWordmarkEngineSnapshot(): CityWordmarkEngineSnapshot {
  return snapshot;
}

export function subscribeCityWordmarkEngine(listener: CityWordmarkEngineListener): () => void {
  listeners.add(listener);
  ensureEventListener();
  maybeStart();
  return () => {
    listeners.delete(listener);
    maybeStop();
    maybeStopEventListener();
  };
}

export function setCityWordmarkEnginePlaying(playing: boolean) {
  if (snapshot.playing === playing) return;
  snapshot = { ...snapshot, playing };
  emit();
  if (playing) {
    maybeStart();
  } else {
    maybeStop();
  }
}

export function setCityWordmarkEngineConfig(overrides: unknown) {
  const nextConfig = mergeCityWordmarkConfig(snapshot.config, overrides);
  ambulanceTriggerIndex = 0;
  actors = [...spawnCarActors({ config: nextConfig, layout }), ...spawnStreetlightActors({ config: nextConfig, layout })];
  const actorRects = actors.flatMap((actor) => actor.render({ nowMs: snapshot.nowMs, config: nextConfig, layout }));
  snapshot = { ...snapshot, config: nextConfig, actorRects };
  emit();
}

export function setCityWordmarkEngineTimeOfDay(timeOfDay: number) {
  const nextConfig = { ...snapshot.config, timeOfDay: normalizeTimeOfDay(timeOfDay) };
  const actorRects = actors.flatMap((actor) => actor.render({ nowMs: snapshot.nowMs, config: nextConfig, layout }));
  snapshot = { ...snapshot, config: nextConfig, actorRects };
  emit();
}

export function stepCityWordmarkEngine(steps: number = 1) {
  const count = Math.max(0, Math.floor(steps));
  if (count === 0) return;
  advance(count * FIXED_STEP_MS);
  emit();
}
