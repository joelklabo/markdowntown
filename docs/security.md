# Security posture

## Threat model (concise)
- **Attack surface:** public read APIs (/api/public/*), auth/session endpoints, builder/editor UI, database-backed CRUD.
- **Risks:** token/session theft, SSRF via markdown/content, cache poisoning, rate-limit bypass, XSS via rendered markdown, abuse of public library writes (currently gated).
- **Data sensitivity:** public library content is low sensitivity; user accounts and saved documents are private.

## Controls
- **Auth & sessions:** NextAuth with database sessions; robots/noindex enforced when `PUBLIC_LIBRARY` flag is off to prevent accidental indexing. Healthcheck unauthenticated only.
- **Rate limits:** server-side rate limiter on section CRUD; extend to future engagement APIs.
- **Caching:** `cacheHeaders` + tag revalidation; session cookies trigger `private, no-store` to avoid mixing cached variants.
- **Security headers:** set globally via `next.config.ts` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=()`).
- **Feature flags:** `public_library`, `builder_v2`, `templates_v1`, `engagement_v1` control surface area; keep off in prod until ready.
- **Robots/sitemap:** `robots.ts` disallows `/` when `PUBLIC_LIBRARY` flag is false.
- **Error reporting:** Sentry client/server configs; PostHog for RUM.

## TODO / follow-ups
- Add CSP tuned for PostHog/Sentry/Next assets.
- Extend rate limiting to public search and engagement endpoints.
- Add markdown sanitization assertions in tests for snippet/template render paths.
- Wire trace IDs into centralized logging backend.
