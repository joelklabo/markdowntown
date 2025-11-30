# MarkdownTown — Developer Onboarding

## Prerequisites
- Node.js 20+ (ships on Azure Container Apps and matches Dockerfile).
- pnpm (`corepack enable pnpm`).
- SQLite for local dev (bundled with Prisma; no separate install).
- Optional: Docker if you want to run the container locally.

## First-time setup
1) Install dependencies  
```bash
pnpm install
```

2) Configure environment  
```bash
cp .env.example .env.local
```
Fill in:
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` (GitHub OAuth app with callback `http://localhost:3000/api/auth/callback`).
- `NEXTAUTH_SECRET` (random string).
- `NEXTAUTH_URL` (usually http://localhost:3000).

3) Database and Prisma  
```bash
pnpm prisma generate       # builds Prisma client
pnpm prisma migrate deploy # applies migrations to sqlite dev db
```

## Run the app
```bash
pnpm dev
```
Visit http://localhost:3000. Sign in with GitHub to unlock the composer UI.

## Quality checks
```bash
pnpm lint        # ESLint (Next core-web-vitals rules)
pnpm type-check  # tsc --noEmit
```

## Working on issues with Beads
- Initialize: `bd init` (already done). Issues live in `.beads`.
- List open work: `bd list`.
- Create a child task under an epic: `bd create --parent <epic-id> "Title here"`.
- Sync to git: commit the `.beads` changes like code.

## Docker (local)
```bash
docker build -t markdowntown .
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e NEXTAUTH_SECRET=dev \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e GITHUB_CLIENT_ID=placeholder \
  -e GITHUB_CLIENT_SECRET=placeholder \
  markdowntown
```

## Deployment (high level)
- Build & push image (GHCR/ACR).
- `az containerapp create ... --image <image> --env-vars NEXTAUTH_URL=<url> --secrets DATABASE_URL=... GITHUB_CLIENT_ID=... GITHUB_CLIENT_SECRET=... NEXTAUTH_SECRET=...`
- Keep `min-replicas=1` to avoid cold starts.

If something breaks, check `pnpm prisma migrate deploy` was run and the env vars are set.
