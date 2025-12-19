import { describe, expect, it } from "vitest";
import { getDefaultCityWordmarkConfig, mergeCityWordmarkConfig } from "@/components/wordmark/sim/config";
import { createCityWordmarkLayout } from "@/components/wordmark/sim/layout";
import { spawnStreetlightActors } from "@/components/wordmark/sim/actors/streetlight";

describe("spawnStreetlightActors", () => {
  it("spawns deterministically for a given seed", () => {
    const layout = createCityWordmarkLayout();
    const config = mergeCityWordmarkConfig(getDefaultCityWordmarkConfig(), {
      seed: "seed",
      density: "dense",
      timeOfDay: 0.04,
    });

    const a = spawnStreetlightActors({ config, layout }).flatMap((actor) => actor.render({ nowMs: 1234, config, layout }));
    const b = spawnStreetlightActors({ config, layout }).flatMap((actor) => actor.render({ nowMs: 1234, config, layout }));
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
  });

  it("does not render during the day", () => {
    const layout = createCityWordmarkLayout();
    const base = mergeCityWordmarkConfig(getDefaultCityWordmarkConfig(), { seed: "seed", density: "normal" });

    const dayConfig = mergeCityWordmarkConfig(base, { timeOfDay: 0.55 });
    const nightConfig = mergeCityWordmarkConfig(base, { timeOfDay: 0.04 });

    const dayRects = spawnStreetlightActors({ config: dayConfig, layout }).flatMap((actor) =>
      actor.render({ nowMs: 0, config: dayConfig, layout })
    );
    const nightRects = spawnStreetlightActors({ config: nightConfig, layout }).flatMap((actor) =>
      actor.render({ nowMs: 0, config: nightConfig, layout })
    );

    expect(dayRects).toEqual([]);
    expect(nightRects.length).toBeGreaterThan(0);
  });

  it("respects config.actors.streetlights", () => {
    const layout = createCityWordmarkLayout();
    const config = getDefaultCityWordmarkConfig();
    const disabled = { ...config, actors: { ...config.actors, streetlights: false } };
    expect(spawnStreetlightActors({ config: disabled, layout })).toEqual([]);
  });
});

