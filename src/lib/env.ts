import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  // Supabase pooled connection string (Transaction mode, port 6543).
  DATABASE_URL: z.url(),
});

let cached: z.infer<typeof serverEnvSchema> | undefined;

/** Validated server-side environment. Throws a readable error if something is missing. */
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
