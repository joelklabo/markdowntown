import type { CityWordmarkLayout, CityWordmarkVoxelRect } from "../layout";
import type { CityWordmarkConfig } from "../types";

export type CityWordmarkActorTone = "car" | "headlight";

export type CityWordmarkActorRect = CityWordmarkVoxelRect & {
  tone: CityWordmarkActorTone;
  opacity?: number;
};

export type CityWordmarkActorContext = {
  config: CityWordmarkConfig;
  layout: CityWordmarkLayout;
};

export type CityWordmarkActorUpdateContext = CityWordmarkActorContext & {
  nowMs: number;
  dtMs: number;
};

export type CityWordmarkActorRenderContext = CityWordmarkActorContext & {
  nowMs: number;
};

export type CityWordmarkActor = {
  kind: string;
  update: (ctx: CityWordmarkActorUpdateContext) => CityWordmarkActor;
  render: (ctx: CityWordmarkActorRenderContext) => CityWordmarkActorRect[];
};

