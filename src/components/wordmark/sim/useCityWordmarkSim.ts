'use client';

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { CityWordmarkConfig } from "./types";
import type { CityWordmarkActorRect } from "./actors/types";
import {
  getCityWordmarkEngineSnapshot,
  setCityWordmarkEngineConfig,
  setCityWordmarkEnginePlaying,
  setCityWordmarkEngineTimeOfDay,
  stepCityWordmarkEngine,
  subscribeCityWordmarkEngine,
} from "./engine";

type CityWordmarkSimSnapshot = ReturnType<typeof getCityWordmarkEngineSnapshot>;

const subscribeNoop = () => () => {};

const frozenDefaults: CityWordmarkSimSnapshot = {
  ...getCityWordmarkEngineSnapshot(),
  playing: false,
};

export type CityWordmarkSim = {
  nowMs: number;
  playing: boolean;
  config: CityWordmarkConfig;
  actorRects: readonly CityWordmarkActorRect[];
  setPlaying: (playing: boolean) => void;
  togglePlaying: () => void;
  setTimeOfDay: (timeOfDay: number) => void;
  step: (steps?: number) => void;
  setConfig: (overrides: unknown) => void;
};

export function useCityWordmarkSim(options: { enabled?: boolean } = {}): CityWordmarkSim {
  const enabled = options.enabled ?? true;

  const snapshot = useSyncExternalStore(
    enabled ? subscribeCityWordmarkEngine : subscribeNoop,
    enabled ? getCityWordmarkEngineSnapshot : () => frozenDefaults,
    () => frozenDefaults
  );

  const setPlaying = useCallback(
    (playing: boolean) => {
      if (!enabled) return;
      setCityWordmarkEnginePlaying(playing);
    },
    [enabled]
  );

  const togglePlaying = useCallback(() => {
    if (!enabled) return;
    setCityWordmarkEnginePlaying(!getCityWordmarkEngineSnapshot().playing);
  }, [enabled]);

  const setTimeOfDay = useCallback(
    (timeOfDay: number) => {
      if (!enabled) return;
      setCityWordmarkEngineTimeOfDay(timeOfDay);
    },
    [enabled]
  );

  const step = useCallback(
    (steps: number = 1) => {
      if (!enabled) return;
      stepCityWordmarkEngine(steps);
    },
    [enabled]
  );

  const setConfig = useCallback(
    (overrides: unknown) => {
      if (!enabled) return;
      setCityWordmarkEngineConfig(overrides);
    },
    [enabled]
  );

  return useMemo(
    () => ({
      nowMs: snapshot.nowMs,
      playing: snapshot.playing,
      config: snapshot.config,
      actorRects: snapshot.actorRects,
      setPlaying,
      togglePlaying,
      setTimeOfDay,
      step,
      setConfig,
    }),
    [
      setConfig,
      setPlaying,
      setTimeOfDay,
      snapshot.actorRects,
      snapshot.config,
      snapshot.nowMs,
      snapshot.playing,
      step,
      togglePlaying,
    ]
  );
}
