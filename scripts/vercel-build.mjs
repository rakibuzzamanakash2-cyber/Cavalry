// Build on Vercel. Production deployments apply pending database migrations
// first (to the DIRECT_URL database); preview deployments never touch the
// schema, so a pull request can't change the production database.
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });
const env = process.env.VERCEL_ENV ?? "local";

const missing = ["DATABASE_URL", "BETTER_AUTH_SECRET"].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing environment variables for the ${env} build: ${missing.join(", ")}`);
  process.exit(1);
}

if (env === "production") {
  if (!process.env.DIRECT_URL) {
    console.error("DIRECT_URL is needed in production to apply migrations.");
    process.exit(1);
  }
  console.log("Applying database migrations…");
  run("npx prisma migrate deploy");
} else {
  console.log(`Skipping migrations for a ${env} build.`);
}

run("npx next build");
