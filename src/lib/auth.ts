import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "./db";
import { isAdminEmail } from "./roles";

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

  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
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
