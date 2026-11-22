import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  // Neon pooled connection string (hostname contains "-pooler").
  DATABASE_URL: z.url(),
});

let cached: z.infer<typeof serverEnvSchema> | undefined;

/** Validated server-side environment. Throws a readable error if something is wrong. */
export function serverEnv() {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment variables: ${fields}. See .env.example.`);
  }
  cached = parsed.data;
  return cached;
}
