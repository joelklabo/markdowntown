import { describe, expect, it } from "vitest";
import { getDefaultCityWordmarkConfig, mergeCityWordmarkConfig } from "@/components/wordmark/sim/config";
import { createCityWordmarkLayout } from "@/components/wordmark/sim/layout";
import { spawnPedestrianActors } from "@/components/wordmark/sim/actors/pedestrian";

describe("spawnPedestrianActors", () => {
  it("spawns deterministically for a given seed", () => {
    const layout = createCityWordmarkLayout();
    const config = mergeCityWordmarkConfig(getDefaultCityWordmarkConfig(), {
      seed: "seed",
      density: "dense",
      timeOfDay: 0.55,
    });

    const a = spawnPedestrianActors({ config, layout }).flatMap((actor) => actor.render({ nowMs: 1234, config, layout }));
    const b = spawnPedestrianActors({ config, layout }).flatMap((actor) => actor.render({ nowMs: 1234, config, layout }));
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
  });

  it("moves over time along a short loop path", () => {
    const layout = createCityWordmarkLayout();
    const config = mergeCityWordmarkConfig(getDefaultCityWordmarkConfig(), { seed: "seed", density: "dense", timeOfDay: 0.55 });

    const a = spawnPedestrianActors({ config, layout }).flatMap((actor) => actor.render({ nowMs: 0, config, layout }));
    const b = spawnPedestrianActors({ config, layout }).flatMap((actor) => actor.render({ nowMs: 5000, config, layout }));

    const bodyXs = (rects: typeof a) => rects.filter((r) => r.tone === "pedestrian" && r.opacity === 0.85).map((r) => r.x);
    expect(bodyXs(a)).not.toEqual(bodyXs(b));
  });

  it("renders dogs only when enabled", () => {
    const layout = createCityWordmarkLayout();
    const base = mergeCityWordmarkConfig(getDefaultCityWordmarkConfig(), { seed: "seed", density: "dense", timeOfDay: 0.55 });

    const noDogs = mergeCityWordmarkConfig(base, { actors: { dogs: false } });
    const withDogs = mergeCityWordmarkConfig(base, { actors: { dogs: true } });

    const a = spawnPedestrianActors({ config: noDogs, layout }).flatMap((actor) => actor.render({ nowMs: 0, config: noDogs, layout }));
    const b = spawnPedestrianActors({ config: withDogs, layout }).flatMap((actor) =>
      actor.render({ nowMs: 0, config: withDogs, layout })
    );

    expect(a.some((r) => r.tone === "dog")).toBe(false);
    expect(b.some((r) => r.tone === "dog")).toBe(true);
  });

  it("respects config.actors.pedestrians", () => {
    const layout = createCityWordmarkLayout();
    const config = getDefaultCityWordmarkConfig();
    const disabled = { ...config, actors: { ...config.actors, pedestrians: false } };
    expect(spawnPedestrianActors({ config: disabled, layout })).toEqual([]);
  });
});

