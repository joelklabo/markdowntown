import index from "./index.generated.json";

export type AtlasSearchItemKind = "platform" | "artifact" | "claim" | "guide" | "example";

export type AtlasSearchItem = {
  id: string;
  kind: AtlasSearchItemKind;
  title: string;
  filePath: string;
  platformId?: string;
  artifactKind?: string;
  claimId?: string;
  guideKind?: "concepts" | "recipes";
  slug?: string;
  fileName?: string;
  paths?: string[];
};

export type AtlasSearchIndex = {
  schemaVersion: 1;
  generatedAt: string;
  items: AtlasSearchItem[];
};

export function loadAtlasSearchIndex(): AtlasSearchIndex {
  return index as AtlasSearchIndex;
}

