import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (Next.js convention), then .env.
config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct (non-pooled) connection: DIRECT_URL on Neon.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
    // Only needed for `migrate dev` / drift checks against an empty scratch database.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
