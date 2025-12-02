export type CacheProfile = {
  sMaxAge: number;
  staleWhileRevalidate: number;
};

export const cacheProfiles: Record<string, CacheProfile> = {
  landing: { sMaxAge: 60, staleWhileRevalidate: 300 },
  browse: { sMaxAge: 60, staleWhileRevalidate: 300 },
  detail: { sMaxAge: 300, staleWhileRevalidate: 900 },
  og: { sMaxAge: 3600, staleWhileRevalidate: 3600 },
};

export function cacheHeaders(profile: keyof typeof cacheProfiles) {
  const cfg = cacheProfiles[profile];
  return {
    "Cache-Control": `public, s-maxage=${cfg.sMaxAge}, stale-while-revalidate=${cfg.staleWhileRevalidate}`,
  } as const;
}
