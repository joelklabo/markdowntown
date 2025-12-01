# Anonymous Reads, Auth-Only Writes (Next.js App Router + NextAuth)
Date: 2025-12-01  
Issue: markdowntown-7z8.3

## Goals
- Keep public pages and read APIs fully anonymous/cacheable.
- Gate all write/engagement actions (create, update, delete, vote, favorite, comment) behind auth.
- Minimize session leakage into cached public responses.

## Patterns to use
- **Middleware allowlist:** Apply `withAuth` middleware to mutating routes only (e.g., `/api/secure/:path*`, server actions under `/app/(auth-required)/**`). Leave public reads un-matched to avoid cache pollution and prefetch costs.
- **Server-side enforcement:** In every write handler/server action, call `getToken`/`getServerSession`; bail with 401 if missing. Do not rely on client-side guards.
- **Split responses:** For detail pages, fetch public data with caching (`revalidate/tag`) and layer a second uncached fetch for user-specific bits (vote/favorite state) keyed by session.
- **Cookie hygiene:** Auth cookies `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`; set `Vary: Cookie` on any response that can differ for authed users.
- **Session strategy:** Prefer `strategy: 'jwt'` for stateless public reads; switch to database sessions if revocation/rotation or multi-device invalidation becomes required.

## Rate limiting & abuse controls
- **Buckets:** Per-IP and per-user buckets for writes; finer buckets for votes/comments (e.g., 30/min IP, 10/min user). Keep reads largely unthrottled but monitor.
- **Edge enforcement:** Use middleware with a KV/Redis counter (Upstash/Vercel KV) so limits are applied before route logic executes; return 429 with `Retry-After`.
- **Bot friction:** Add Turnstile/hCaptcha for unauthenticated heavy-write patterns (e.g., first comment) and for suspicious IPs (high 429 rate). Verify tokens server-side before processing.
- **Content validation:** Reuse existing markdown sanitization; strip HTML from comments/template fields to prevent script injection when later rendered.

## CSRF & methods
- All POST/PUT/PATCH/DELETE must require a valid session and reject anonymous requests; add CSRF token checking for credential/session-based auth flows.
- Keep GET side-effect free. If a GET needs auth-specific data, set `Cache-Control: private, no-store`.

## Logging & monitoring
- Log rate-limit hits, auth failures, and captcha failures with IP, userId, and route to spot abuse.
- Add alerting on sudden spikes of 401/429 to detect scraping or credential stuffing attempts.

## Implementation checklist
- [ ] `middleware.ts` matcher for `/api/(secure|private)/:path*` and any write-heavy server actions.
- [ ] Helper `requireSession()` for route handlers/server actions to centralize 401 behavior.
- [ ] Add `Vary: Cookie` + `Cache-Control: s-maxage=60, stale-while-revalidate=300` to public read APIs; `no-store` for authed overlays.
- [ ] Rate limiter utility usable from middleware + API routes; env-backed KV/Redis.
- [ ] Captcha verification endpoint + client hook for comment/vote forms when flagged.
