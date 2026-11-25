import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "./db";
import { isAdminEmail } from "./roles";
import { authUrl, trustedOrigins } from "./urls";

function createAuth() {
  const google =
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined;

  const secret = process.env.BETTER_AUTH_SECRET;
  if (process.env.VERCEL_ENV && (!secret || secret.length < 32)) {
    throw new Error("BETTER_AUTH_SECRET must be set (32+ characters) on Vercel.");
  }

  return betterAuth({
    secret,
    baseURL: authUrl(),
    trustedOrigins: trustedOrigins(),
    // Keep counts in the database: memory limits reset on every serverless
    // instance, so they would barely limit anything on Vercel.
    rateLimit: { storage: "database" },
    database: prismaAdapter(getDb(), { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      autoSignIn: true,
    },
    socialProviders: google,
    user: {
      additionalFields: {
        // Never settable from sign-up forms; changed only by admins.
        role: { type: "string", defaultValue: "user", input: false, required: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          // Founders listed in ADMIN_EMAILS become admins automatically, but only
          // when the provider has verified the email (e.g. Google). Unverified
          // email/password sign-ups are never promoted, so nobody can claim an
          // admin address just by registering it.
          before: async (user) => {
            if (user.emailVerified && isAdminEmail(user.email)) {
              return { data: { ...user, role: "admin" } };
            }
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

type Auth = ReturnType<typeof createAuth>;
const globalForAuth = globalThis as unknown as { __cavalryAuth?: Auth };

/** Lazily created so modules can import it without opening a database connection. */
export function getAuth(): Auth {
  if (!globalForAuth.__cavalryAuth) globalForAuth.__cavalryAuth = createAuth();
  return globalForAuth.__cavalryAuth;
}

export const googleSignInEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);
