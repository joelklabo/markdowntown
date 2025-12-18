import { z } from "zod";
import type { CityWordmarkActorsConfig, CityWordmarkConfig, CityWordmarkDensity } from "./types";

const densitySchema = z.enum(["sparse", "normal", "dense"]) satisfies z.ZodType<CityWordmarkDensity>;

const defaultActors: CityWordmarkActorsConfig = {
  cars: true,
  streetlights: true,
  pedestrians: true,
  ambulance: true,
};

const actorsSchema = z.object({
  cars: z.boolean().default(defaultActors.cars),
  streetlights: z.boolean().default(defaultActors.streetlights),
  pedestrians: z.boolean().default(defaultActors.pedestrians),
  ambulance: z.boolean().default(defaultActors.ambulance),
});

const actorsOverridesSchema = z
  .object({
    cars: z.boolean().optional(),
    streetlights: z.boolean().optional(),
    pedestrians: z.boolean().optional(),
    ambulance: z.boolean().optional(),
  })
  .strict();

const configSchema = z.object({
  seed: z.string().min(1).default("markdowntown"),
  timeOfDay: z.number().min(0).max(1).default(0.78),
  timeScale: z.number().positive().default(1),
  density: densitySchema.default("normal"),
  actors: actorsSchema.default(defaultActors),
});

const configOverridesSchema = z.object({
  seed: z.string().min(1).optional(),
  timeOfDay: z.number().min(0).max(1).optional(),
  timeScale: z.number().positive().optional(),
  density: densitySchema.optional(),
  actors: actorsOverridesSchema.optional(),
});

export type CityWordmarkConfigInput = z.input<typeof configSchema>;

export function getDefaultCityWordmarkConfig(): CityWordmarkConfig {
  return configSchema.parse({});
}

export function mergeCityWordmarkConfig(base: CityWordmarkConfig, overrides: unknown): CityWordmarkConfig {
  if (overrides == null) return base;
  const parsedOverrides = configOverridesSchema.parse(overrides);
  return configSchema.parse({
    ...base,
    ...parsedOverrides,
    actors: {
      ...base.actors,
      ...(parsedOverrides.actors ?? {}),
    },
  });
}
