import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

function createDb() {
  // prepare: false is required for Supabase's transaction-mode pooler.
  const client = postgres(serverEnv().DATABASE_URL, { prepare: false, max: 5 });
  return drizzle(client, { schema, casing: "snake_case" });
}

type Db = ReturnType<typeof createDb>;

// Reuse one client across hot reloads in development.
const globalForDb = globalThis as unknown as { __cavalryDb?: Db };

/** Lazily created so builds without a database (e.g. CI) do not fail at import time. */
export function getDb(): Db {
  if (!globalForDb.__cavalryDb) globalForDb.__cavalryDb = createDb();
  return globalForDb.__cavalryDb;
}

export { schema };
