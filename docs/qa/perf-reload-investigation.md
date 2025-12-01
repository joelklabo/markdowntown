# Reload Performance Investigation Plan
Date: 2025-12-01
Issue: markdowntown-43g.3

## Hypotheses
- Slow reload driven by cache misses (no CDN caching on `/browse`?), heavy JS bundle, or blocking third-party scripts.
- API latency for `/api/public/items` impacting hydration; TTFB spikes on dynamic routes.
- Layout shifts from late-loading fonts/assets inflating LCP.

## Immediate steps
1) Capture real traces
   - Use `npm run dev` + `NEXT_TELEMETRY_DEBUG=1` locally and `lighthouse-baseline.sh` against staging with throttling.
   - Record Chrome performance trace on `/` and `/browse` reload.
   - Grab response headers for HTML/JS (cache-control, content-length, age, cf-cache-status).
2) Inspect bundle weight
   - Run `NEXT_DEBUG_BUNDLE_SIZE=1 next build` and analyze largest chunks; check shared layout imports.
3) API timing
   - Log timing for `/api/public/items` and `/api/public/sections` in staging; ensure ISR or caching enabled where safe.
4) Fonts/assets
   - Verify font-loading strategy; consider `display=swap` and preloading hero image if any.

## Fix candidates
- Enable CDN cache/`s-maxage` on public pages and `/api/public/items` (with tag params), add stale-while-revalidate.
- Split vendor bundle: lazy-load heavy components (builder, markdown preview) off browse/landing.
- Defer non-critical scripts (Posthog, analytics) with `defer`/`lazy` loading.
- Preconnect to `fonts.gstatic.com`, inline critical CSS (if small), and add `priority` to logo.

## Metrics to watch (via PerfVitals/PostHog & Lighthouse)
- TTFB, LCP, CLS per route; JS transfer size; HTML cache hit-rate.
- API latency p50/p95 for public endpoints.

## Deliverables
- Trace captures + before/after Lighthouse scores.
- Recommended changes with estimated wins and risks.
- Follow-up issues for chosen fixes.
