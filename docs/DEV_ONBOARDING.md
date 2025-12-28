# Developer Onboarding

Welcome to mark downtown. This guide gets you running locally in a few minutes.

## Prerequisites
- Node.js 20 (matches production)
- pnpm (`corepack enable` then `corepack prepare pnpm@latest --activate`)
- Docker (optional, only if you want to build the container locally)

## Clone and install
```bash
git clone git@github.com:joelklabo/markdowntown.git
cd markdowntown
corepack enable
pnpm install
```

## Environment variables
Copy the example file and fill in secrets (ask an admin for prod creds):
```bash
cp .env.example .env.local
```
- `DATABASE_URL`: for local dev you can use SQLite `file:./dev.db` (already set) or point to a local Postgres.
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: use your GitHub OAuth app dev creds.
- `NEXTAUTH_SECRET`: any random string (e.g. `openssl rand -base64 32`).
- `NEXTAUTH_URL`: `http://localhost:3000` for dev.

## Database
If using SQLite (default):
```bash
pnpm prisma migrate dev --name init
```
If using Postgres, set `DATABASE_URL` to your Postgres URI then run the same command.

## Run the app
```bash
pnpm dev
```
The site runs at http://localhost:3000.

## Tests & quality
```bash
pnpm lint          # ESLint
pnpm type-check    # TypeScript
pnpm test          # Vitest (jsdom + node environments)
```

## Analytics & monitoring (opt-in)
- Set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` to enable Sentry in dev.
- Set `NEXT_PUBLIC_POSTHOG_KEY` (and optional `NEXT_PUBLIC_POSTHOG_HOST`) to enable PostHog.

## Build & serve
```bash
pnpm build
pnpm start
```

## Useful scripts
- `pnpm prisma generate` to regen client after schema changes.
- `pnpm prisma studio` (if you add the script) to explore the DB.
- `pnpm test:visual` to update Playwright visual snapshots.

## Codex skills
Validate and install local Codex skills:
```bash
node scripts/codex/validate-skills.mjs
scripts/codex/sync-skills.sh --verbose
```

## GitHub Actions
CI runs lint/type-check/tests on every push/PR. CD builds and deploys to Azure Container Apps on `main` using secrets `AZURE_CREDENTIALS` and `DATABASE_URL`.

## Troubleshooting
- Port 3000 in use: find the process with `lsof -nP -iTCP:3000 -sTCP:LISTEN`, stop it via `kill -15 <pid>` (or `kill -9 <pid>` if needed), or run on an alternate port like `PORT=3001 pnpm dev`.
- Prisma errors with Postgres: ensure your IP is allowed in the DB firewall and `sslmode=require` is present.
- OAuth callback mismatch: set `NEXTAUTH_URL` to your running URL and update GitHub OAuth callback accordingly.
- UI changes not showing in dev: hard-reload (Cmd/Ctrl+Shift+R) or disable cache in DevTools; Turbopack static chunks can stay cached.
- DevTools MCP or browser console shows HMR WebSocket errors / pages 404: restart with polling to avoid watchpack `EMFILE` errors, e.g. `WATCHPACK_POLLING=true WATCHPACK_POLLING_INTERVAL=1000 pnpm dev` (interval defaults to 1000ms when set via config).
- DevTools MCP timeouts: confirm the app responds (`curl -I http://localhost:3000`), verify it loads in a browser, then restart the MCP bridge/agent and open a fresh DevTools page. Capture the MCP error text and `WATCHPACK_POLLING` settings; see `docs/ui/dev-triage.md` for the full checklist.

## Feature flags
- UI flags (default off): `NEXT_PUBLIC_THEME_REFRESH_V1`, `NEXT_PUBLIC_UX_CLARITY_V1`, `NEXT_PUBLIC_INSTRUCTION_HEALTH_V1`, `NEXT_PUBLIC_SCAN_NEXT_STEPS_V1`, `NEXT_PUBLIC_SCAN_QUICK_UPLOAD_V1`.
- Wordmark flags (default on): `NEXT_PUBLIC_WORDMARK_ANIM_V1`, `NEXT_PUBLIC_WORDMARK_BANNER_V1`.

## Living City wordmark (labs)
- Labs entry: `/labs/city-logo` includes controls for voxel scale, detail level, banner scale, and event simulation.
- Feature flags: see the Feature flags section (wordmark flags default on).

Happy shipping! 🎉
