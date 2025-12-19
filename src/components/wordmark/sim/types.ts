export type CityWordmarkDensity = "sparse" | "normal" | "dense";

export type CityWordmarkScheme = "classic" | "noir" | "neon";

export type CityWordmarkRenderConfig = {
  /** Integer pixel scale for each voxel (crisp edges). */
  voxelScale: number;
};

export type CityWordmarkSkylineConfig = {
  minHeight: number;
  maxHeight: number;
  minSegmentWidth: number;
  maxSegmentWidth: number;
};

export type CityWordmarkActorsConfig = {
  cars: boolean;
  trucks: boolean;
  streetlights: boolean;
  pedestrians: boolean;
  dogs: boolean;
  ambulance: boolean;
};

/**
 * Normalized time-of-day value.
 * - 0.00 = midnight
 * - 0.25 = sunrise-ish
 * - 0.50 = noon
 * - 0.75 = sunset-ish
 */
export type CityWordmarkTimeOfDay = number;

export type CityWordmarkConfig = {
  /** Seed for deterministic randomness and stable visual baselines. */
  seed: string;
  /** Normalized time-of-day (0..1). */
  timeOfDay: CityWordmarkTimeOfDay;
  /** Simulation speed multiplier (1 = real-time-ish). */
  timeScale: number;
  /** Density preset used for actor spawn rates, window density, etc. */
  density: CityWordmarkDensity;
  /** Curated color scheme preset. */
  scheme: CityWordmarkScheme;
  /** Render tuning knobs (scale, etc). */
  render: CityWordmarkRenderConfig;
  /** Skyline silhouette tuning. */
  skyline: CityWordmarkSkylineConfig;
  /** Actor toggles. */
  actors: CityWordmarkActorsConfig;
};

export type CityWordmarkEventBase = {
  /** Event timestamp in ms since epoch. */
  ts?: number;
};

export type CityWordmarkEvent =
  | ({ type: "search"; query: string } & CityWordmarkEventBase)
  | ({ type: "command_palette_open"; origin?: string } & CityWordmarkEventBase)
  | ({ type: "publish"; kind?: "artifact" | "template" | "snippet" | "file" } & CityWordmarkEventBase)
  | ({ type: "alert"; kind: "ambulance" } & CityWordmarkEventBase);
