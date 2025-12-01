# Caching & ISR Plan for Public Surfaces
Date: 2025-12-01
Epic: markdowntown-7z8

## Goals
- Keep public browse/detail fast under anonymous-heavy traffic.
- Balance freshness for trending stats with cache efficiency.

## Pages (Next.js App Router)
- Landing (`/`): revalidate 60s; modules fetched via public feeds.
- Browse (`/browse`, `/templates`, `/tags`): revalidate 60s; accept query params, so primary caching is API-side + client search.
- Detail (`/snippets/[slug]`, `/templates/[slug]`, `/files/[slug]`): revalidate 300s; tag-based cache invalidation on update.

## APIs
- Public list/search feeds: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`; paginate; precompute trending.
- Detail APIs: s-maxage=300, stale-while-revalidate=900.
- Engagement/write endpoints: no cache; rate limited.

## Invalidation
- On create/update/delete/vote/favorite/comment/download event: trigger revalidate tags for the affected slug and list feeds.
- Use Next.js `revalidateTag`/`revalidatePath` where possible; fall back to short TTL if tags not feasible.

## Data precomputation
- Trending materialized views refreshed daily/hourly; API serves from MV with short cache.
- Stats counters read from Snippet/Template/Document; optionally from MV for trending lists.

## CDN
- Allow edge caching for GET public endpoints and static assets.
- Respect auth cookies: APIs used by both public and authed should set `Vary: Cookie` or bypass cache when session present if responses differ (prefer separate endpoints for public vs authed).

## Feature flag safety
- While `public_library` is off, return 404 or empty lists and set `Disallow: /` in robots to avoid indexing.

