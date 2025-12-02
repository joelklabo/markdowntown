import { PrismaClient } from "@prisma/client";

// Re-use Prisma client across hot reloads in development.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const skipDb = process.env.SKIP_DB === "1" || process.env.NODE_ENV === "production";
export const hasDatabaseEnv = !skipDb && Boolean(process.env.DATABASE_URL);

// Ensure Prisma always sees a valid Postgres URL (file: isn't allowed with the postgres provider).
// For local/dev fallback we point at localhost Postgres; queries will still be caught elsewhere if it isn't running.
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/markdowntown";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type { Prisma } from "@prisma/client";
