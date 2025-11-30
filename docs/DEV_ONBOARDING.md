# Developer Onboarding

Welcome to MarkdownTown. This guide gets you running locally in a few minutes.

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

## Build & serve
```bash
pnpm build
pnpm start
```

## Useful scripts
- `pnpm prisma generate` to regen client after schema changes.
- `pnpm prisma studio` (if you add the script) to explore the DB.

## GitHub Actions
CI runs lint/type-check/tests on every push/PR. CD builds and deploys to Azure Container Apps on `main` using secrets `AZURE_CREDENTIALS` and `DATABASE_URL`.

## Troubleshooting
- Port 3000 in use: stop the other process or set `PORT=3001 pnpm dev`.
- Prisma errors with Postgres: ensure your IP is allowed in the DB firewall and `sslmode=require` is present.
- OAuth callback mismatch: set `NEXTAUTH_URL` to your running URL and update GitHub OAuth callback accordingly.

Happy shipping! 🎉
