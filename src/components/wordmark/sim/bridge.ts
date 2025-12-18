import { featureFlags } from "@/lib/flags";
import { dispatchCityWordmarkEvent } from "./events";
import type { CityWordmarkEvent } from "./types";

export function emitCityWordmarkEvent(event: CityWordmarkEvent) {
  if (!featureFlags.wordmarkAnimV1) return;

  const withTs: CityWordmarkEvent = {
    ...event,
    ts: event.ts ?? Date.now(),
  };

  dispatchCityWordmarkEvent(withTs);
}

