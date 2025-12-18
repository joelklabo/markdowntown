import { describe, expect, it } from "vitest";
import { getDefaultCityWordmarkConfig, mergeCityWordmarkConfig } from "@/components/wordmark/sim/config";
import { createCityWordmarkLayout } from "@/components/wordmark/sim/layout";
import { spawnCarActors } from "@/components/wordmark/sim/actors/car";

describe("spawnCarActors", () => {
  it("spawns deterministically for a given seed", () => {
    const layout = createCityWordmarkLayout();
    const config = mergeCityWordmarkConfig(getDefaultCityWordmarkConfig(), {
      seed: "seed",
      density: "dense",
      timeOfDay: 0.9,
    });

    const a = spawnCarActors({ config, layout }).flatMap((actor) => actor.render({ nowMs: 1234, config, layout }));
    const b = spawnCarActors({ config, layout }).flatMap((actor) => actor.render({ nowMs: 1234, config, layout }));
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
  });

  it("does not render headlights during the day", () => {
    const layout = createCityWordmarkLayout();
    const base = mergeCityWordmarkConfig(getDefaultCityWordmarkConfig(), { seed: "seed", density: "normal" });

    const dayConfig = mergeCityWordmarkConfig(base, { timeOfDay: 0.5 });
    const nightConfig = mergeCityWordmarkConfig(base, { timeOfDay: 0.9 });

    const dayRects = spawnCarActors({ config: dayConfig, layout }).flatMap((actor) =>
      actor.render({ nowMs: 0, config: dayConfig, layout })
    );
    const nightRects = spawnCarActors({ config: nightConfig, layout }).flatMap((actor) =>
      actor.render({ nowMs: 0, config: nightConfig, layout })
    );

    expect(dayRects.some((r) => r.tone === "headlight")).toBe(false);
    expect(nightRects.some((r) => r.tone === "headlight")).toBe(true);
  });

  it("respects config.actors.cars", () => {
    const layout = createCityWordmarkLayout();
    const config = getDefaultCityWordmarkConfig();
    const disabled = { ...config, actors: { ...config.actors, cars: false } };
    expect(spawnCarActors({ config: disabled, layout })).toEqual([]);
  });
});
