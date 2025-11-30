# Markdown Town
Compose and preview markdown sections in a three-panel editor, backed by Next.js, Prisma, and GitHub OAuth.

## What’s here
- App Router Next.js 16 + Tailwind v4 UI with list → editor → preview.
- Prisma models for `User`, `Section`, `Agent` (Postgres in prod; SQLite in dev), NextAuth tables.
- RESTful section APIs (`/api/sections`) protected by session auth.
- GitHub login via NextAuth (database sessions).
- Health check at `/api/health`.
- Dockerfile, GitHub Actions CI (lint, type-check, build), Beads backlog.
- Design system: MarkdownTown brand icon, Tailwind tokens, global utilities, and UI primitives (BrandLogo, Button, Card, Pill).
- Release docs: Semantic Versioning, CHANGELOG, and migration/release guides in `docs/`.

## Quick start
```bash
pnpm install
cp .env.example .env.local          # add GitHub OAuth + NEXTAUTH_SECRET
pnpm prisma generate
pnpm prisma migrate dev --name init # seeds the local sqlite db
pnpm dev
```
Open http://localhost:3000 and sign in with GitHub to access the composer.

## Scripts
- `pnpm dev` – run locally
- `pnpm lint` – ESLint (core web vitals rules)
- `pnpm type-check` – TypeScript without emit
- `pnpm test` – Vitest (jsdom + node envs)
- `pnpm build` – production build

## Docker
```
docker build -t markdowntown .
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET=dev \
  -e GITHUB_CLIENT_ID=placeholder \
  -e GITHUB_CLIENT_SECRET=placeholder \
  markdowntown
```

## Deployment (Azure Container Apps outline)
1. Build and push image to ACR or GHCR.
2. `az containerapp create ... --image <registry>/markdowntown:TAG --target-port 3000 --ingress external --min-replicas 1`
3. Configure secrets/env: `DATABASE_URL`, `GITHUB_CLIENT_ID/SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, PostHog/Sentry when added.
4. Add custom domain + cert (see checklist in the issue description).

## Beads workflow
- Issues live in `.beads`. `bd list` to view; tasks are grouped under epics (Application Core, Auth, Composer, DevOps, etc.).
- Create work under an epic: `bd create --parent <epic-id> "Implement X"`.
- Commit `.beads` changes with code for traceability.

## More docs
- Developer onboarding: `docs/DEV_ONBOARDING.md`
- Agent concept (future): `AGENTS.md`
- Release process: `docs/RELEASE_PROCESS.md`
- Migration policy: `docs/MIGRATIONS.md`
