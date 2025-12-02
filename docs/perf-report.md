# Performance reporting

## Where to see the data
- **PostHog dashboards** (create + link here):
  - RUM: `perf_navigation` (TTFB, DOMContentLoaded, load, transfer sizes) filtered by path
  - Web vitals: `web_vital_lcp`, `web_vital_cls`
- **Lighthouse trend artifacts**: `.lighthouse-reload-2025-12-01/` (latest local run); add CI artifacts once automated (see markdowntown-l3p.2).

## Event schema (client)
- `perf_navigation`: { path, ttfb, domContentLoaded, loadEvent, transferSize, encodedBodySize, decodedBodySize }
- `web_vital_lcp`: { path, value }
- `web_vital_cls`: { path, value }
- `web_vital_fcp`, `web_vital_inp`, `web_vital_ttfb`: include path + device/connection hints.
- `spa_nav`: { path, duration } captures soft navigations after route change.
- `perf_api`: sampled fetch/XHR timings with ttfb/duration + cache/server-timing hints.

## Next steps
- Publish dashboard links in this file once created (markdowntown-l3p.1).
- Automate Lighthouse trend capture and link artifacts (markdowntown-l3p.2).
- Add alerts:
  - PostHog insight on `perf_navigation` TTFB p75 per path (/ and /browse) with alert when > 1200ms for 15 minutes.
  - Cache hit ratio: use `perf_navigation.cache` or `perf_api.cache` fields; alert if HIT ratio < 0.8 for 10 minutes.
  - Web vitals: INP p75 > 200ms or LCP p75 > 4000ms sustained for 15 minutes.
