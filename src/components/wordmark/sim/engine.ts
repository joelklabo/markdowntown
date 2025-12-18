import type { CityWordmarkConfig } from "./types";
import { getDefaultCityWordmarkConfig, mergeCityWordmarkConfig } from "./config";
import { normalizeTimeOfDay } from "./time";

export type CityWordmarkEngineListener = () => void;

export type CityWordmarkEngineSnapshot = Readonly<{
  nowMs: number;
  playing: boolean;
  config: CityWordmarkConfig;
}>;

const FIXED_STEP_MS = 100;
const DAY_CYCLE_MS = 240_000;
const MAX_FRAME_MS = 250;

const listeners = new Set<CityWordmarkEngineListener>();

let snapshot: CityWordmarkEngineSnapshot = {
  nowMs: 0,
  playing: true,
  config: getDefaultCityWordmarkConfig(),
};

type FrameHandle = number | ReturnType<typeof setTimeout>;

let handle: FrameHandle | null = null;
let lastFrameMs: number | null = null;
let accumulatorMs = 0;

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

function advance(stepMs: number) {
  const nextNowMs = snapshot.nowMs + stepMs;
  const nextTimeOfDay = normalizeTimeOfDay(
    snapshot.config.timeOfDay + (stepMs * snapshot.config.timeScale) / DAY_CYCLE_MS
  );

  snapshot = {
    ...snapshot,
    nowMs: nextNowMs,
    config: {
      ...snapshot.config,
      timeOfDay: nextTimeOfDay,
    },
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
  maybeStart();
  return () => {
    listeners.delete(listener);
    maybeStop();
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
  snapshot = {
    ...snapshot,
    config: mergeCityWordmarkConfig(snapshot.config, overrides),
  };
  emit();
}

export function setCityWordmarkEngineTimeOfDay(timeOfDay: number) {
  snapshot = {
    ...snapshot,
    config: {
      ...snapshot.config,
      timeOfDay: normalizeTimeOfDay(timeOfDay),
    },
  };
  emit();
}

export function stepCityWordmarkEngine(steps: number = 1) {
  const count = Math.max(0, Math.floor(steps));
  if (count === 0) return;
  advance(count * FIXED_STEP_MS);
  emit();
}
