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

function hasSessionCookie(cookieHeader?: string | null) {
  if (!cookieHeader) return false;
  return /next-auth\.session-token|__Secure-next-auth\.session-token|next-auth\.callback-url/.test(cookieHeader);
}

export function cacheHeaders(profile: keyof typeof cacheProfiles, cookieHeader?: string | null) {
  if (hasSessionCookie(cookieHeader)) {
    return {
      "Cache-Control": "private, no-store",
      Vary: "Cookie",
    } as const;
  }
  const cfg = cacheProfiles[profile];
  return {
    "Cache-Control": `public, s-maxage=${cfg.sMaxAge}, stale-while-revalidate=${cfg.staleWhileRevalidate}`,
    "CDN-Cache-Control": `public, s-maxage=${cfg.sMaxAge}, stale-while-revalidate=${cfg.staleWhileRevalidate}`,
    Vary: "Cookie",
  } as const;
}
