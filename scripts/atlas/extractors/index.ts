import type { AtlasExtractor } from "./types.ts";

const noopExtractor: AtlasExtractor = {
  sourceId: "__noop__",
  extract: async () => ({ claims: [], featureSupport: {} }),
};

const registry = new Map<string, AtlasExtractor>();

export function registerExtractor(extractor: AtlasExtractor) {
  registry.set(extractor.sourceId, extractor);
}

export function getExtractor(sourceId: string): AtlasExtractor {
  return registry.get(sourceId) ?? { ...noopExtractor, sourceId };
}

