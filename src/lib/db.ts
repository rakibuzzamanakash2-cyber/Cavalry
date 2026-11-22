import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { serverEnv } from "./env";

// One client per server process, reused across hot reloads in development.
const globalForPrisma = globalThis as unknown as { __cavalryPrisma?: PrismaClient };

/** Lazily created, so builds and pages without a database never open a connection. */
export function getDb(): PrismaClient {
  if (!globalForPrisma.__cavalryPrisma) {
    const adapter = new PrismaPg({ connectionString: serverEnv().DATABASE_URL, max: 5 });
    globalForPrisma.__cavalryPrisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.__cavalryPrisma;
}
