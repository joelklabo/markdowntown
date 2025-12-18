import { describe, expect, it } from "vitest";
import { dispatchCityWordmarkEvent } from "@/components/wordmark/sim/events";
import {
  getCityWordmarkEngineSnapshot,
  setCityWordmarkEngineConfig,
  setCityWordmarkEnginePlaying,
  subscribeCityWordmarkEngine,
} from "@/components/wordmark/sim/engine";

describe("CityWordmark engine events", () => {
  it("spawns an ambulance actor on alert events", () => {
    setCityWordmarkEnginePlaying(false);
    setCityWordmarkEngineConfig({
      seed: "seed",
      density: "normal",
      actors: { cars: false, ambulance: true },
    });

    const unsubscribe = subscribeCityWordmarkEngine(() => {});
    dispatchCityWordmarkEvent({ type: "alert", kind: "ambulance", ts: 1 });

    const snapshot = getCityWordmarkEngineSnapshot();
    expect(snapshot.actorRects.some((r) => r.tone === "sirenRed")).toBe(true);
    expect(snapshot.actorRects.some((r) => r.tone === "sirenBlue")).toBe(true);

    unsubscribe();
  });
});

