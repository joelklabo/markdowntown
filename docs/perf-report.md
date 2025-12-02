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

## Next steps
- Publish dashboard links in this file once created (markdowntown-l3p.1).
- Automate Lighthouse trend capture and link artifacts (markdowntown-l3p.2).
