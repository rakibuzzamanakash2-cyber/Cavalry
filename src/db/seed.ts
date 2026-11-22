// Seeds starter content. Run with: npm run db:seed
// Safe to re-run: rows are upserted by slug.
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config({ path: [".env.local", ".env"], quiet: true });

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL (or DIRECT_URL) in .env.local or .env first.");

const client = postgres(url, { prepare: false, max: 1 });
const db = drizzle(client, { schema, casing: "snake_case" });

async function main() {
  await db
    .insert(schema.teamMembers)
    .values([
      {
        slug: "rakib",
        name: "Md Rakibuzzaman",
        role: "Co-founder · Project & data lead",
        isFounder: true,
        sortOrder: 1,
      },
      {
        slug: "rubayet",
        name: "Rubayet",
        role: "Co-founder · Technical lead",
        isFounder: true,
        sortOrder: 2,
      },
    ])
    .onConflictDoNothing({ target: schema.teamMembers.slug });

  await db
    .insert(schema.projects)
    .values({
      slug: "disasters-and-public-spending",
      title: "Disasters and the composition of public spending",
      summary:
        "How do physically intense natural hazards change the sector shares and real levels of government spending in the years that follow?",
      status: "planning",
      isFeatured: true,
      sortOrder: 1,
    })
    .onConflictDoNothing({ target: schema.projects.slug });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
