# Caching & ISR Plan for Public Surfaces
Date: 2025-12-01
Epic: markdowntown-7z8

## Goals
- Keep public browse/detail fast under anonymous-heavy traffic.
- Balance freshness for trending stats with cache efficiency.
- Respect personalization: authed users should never receive cached public responses that hide their own votes/favorites.

## Building blocks (Next.js 16)
- Default `fetch` is **not cached**; opt into caching with `cache: 'force-cache'` or `next.revalidate` on App Router data fetches.
- Tag cached fetches/functions with `next.tags` or `cacheTag('snippets')` so we can invalidate via `revalidateTag` (SWR) or `updateTag` (read-your-writes from Server Actions).
- Prefer `revalidateTag(tag, 'max')` for background SWR; reserve `updateTag` for Server Actions that must block until new data is fetched.
- Use `cacheLife` profiles sparingly (`hours|days`) for slow-changing assets (e.g., OG base image metadata); keep list/detail on `'max'`.

## Pages (Next.js App Router)
- Landing (`/`): `revalidate = 60`; data fetches tagged `landing`, `trending`, `featured`. For signed-in sessions, bail to dynamic by checking `cookies().has('next-auth.session-token')`.
- Browse (`/browse`, `/templates`, `/tags`): static shell with client params; server data calls use `next: { revalidate: 60, tags: ['list', type] }`. Search queries stay dynamic (`cache: 'no-store'`) but share API cache via headers below.
- Detail (`/snippets/[slug]`, `/templates/[slug]`, `/files/[slug]`): `revalidate = 300`, tags per record (`snippet:<slug>`, `template:<slug>`, `file:<slug>`). Logged-in users get additional user-affecting bits (vote/favorite state) via a separate un-cached fetch.
- OG/image routes: `revalidate = 3600`, `s-maxage=3600`, tagged `og:<slug>`; keep templates tiny to fit CDN.

## APIs
- Public list/search feeds: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`; responses tagged `feed:<type>` + `tag:<tag>`; paginate; return `Vary: Cookie` to differentiate authed users (who may see personal vote/fav flags).
- Detail APIs: `s-maxage=300, stale-while-revalidate=900`, tags per entity; add `ETag/If-None-Match` to reduce bytes for frequent refresh.
- Engagement/write endpoints: `Cache-Control: no-store`; immediately call `revalidateTag` (SWR) + `updateTag` inside Server Action flows so the author sees their change without waiting.
- Search: cache only empty-query + sort combos (60s); all term queries `no-store` to avoid leaking personalized results.

## Invalidation
- On create/update/delete/vote/favorite/comment/download: `revalidateTag` the entity tag + related list tags (`feed:snippets`, `tag:<tag>`) with profile `'max'` (SWR). Use `updateTag` only for user-facing Server Actions (e.g., inline editor save) to force immediate refresh.
- Revalidate landing aggregates (`trending`, `featured`) on hourly cron and on large stat deltas; otherwise rely on TTL.
- If tag wiring fails, fallback TTLs (60/300s) prevent unbounded staleness.

## Data precomputation
- Trending materialized views refreshed daily/hourly; API serves from MV with short cache.
- Stats counters read from Snippet/Template/Document; optionally from MV for trending lists.

## CDN
- Allow edge caching for GET public endpoints and static assets.
- Respect auth cookies: APIs used by both public and authed should set `Vary: Cookie` or bypass cache when session present if responses differ (prefer separate endpoints for public vs authed).
- Keep CDN TTLs aligned to route `s-maxage`; enable gzip/br for JSON feeds; block set-cookie on cached responses.

## Feature flag safety
- While `public_library` is off, return 404 or empty lists and set `Disallow: /` in robots to avoid indexing.

## Monitoring & guardrails
- Track cache hit/miss + revalidate counts (e.g., via Next.js logs + APM) to spot thrash.
- Alert on revalidate queue backlog or elevated origin QPS to catch cache bypass regressions.
