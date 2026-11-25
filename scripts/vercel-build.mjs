// Build on Vercel. Pending database migrations are applied first, to the
// DIRECT_URL database of that environment: production migrates the live
// database, previews migrate the separate preview database, so the code being
// built always finds the tables it expects. Never point Preview at the
// production database.
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });
const env = process.env.VERCEL_ENV ?? "local";

const missing = ["DATABASE_URL", "BETTER_AUTH_SECRET"].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing environment variables for the ${env} build: ${missing.join(", ")}`);
  process.exit(1);
}

if (env === "production" || env === "preview") {
  if (!process.env.DIRECT_URL) {
    console.error(`DIRECT_URL is needed for the ${env} build to apply migrations.`);
    process.exit(1);
  }
  console.log(`Applying database migrations (${env})…`);
  run("npx prisma migrate deploy");
} else {
  console.log("Skipping migrations for a local build.");
}

run("npx next build");
