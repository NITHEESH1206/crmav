import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client.
 *
 * Neon notes:
 *  - The DATABASE_URL should point at the pooler endpoint and include
 *    `connect_timeout=15&pool_timeout=15` so we get more headroom during
 *    auto-suspend cold-starts (free tier sleeps after ~5min idle).
 *  - We don't enable Prisma's `log: query` in dev because Neon's wakeup
 *    spam drowns out the real signal.
 */
declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

export const prisma =
  global.prismaClient ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    // No explicit datasource override — DATABASE_URL is read from env.
  });

if (process.env.NODE_ENV !== "production") global.prismaClient = prisma;
