import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "./db";
import { identifierKind, normalizeUid, normalizeUsername } from "./identity";
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
        // Given by the database at sign-up; never set from forms.
        uid: { type: "string", input: false, required: false },
        // Set on the account page, where it is checked and kept unique.
        username: { type: "string", input: false, required: false },
      },
    },
    hooks: {
      // The sign-in form takes an email, a username or a UID. Before the normal
      // password check, swap a username or UID for the account's email. Unknown
      // names become an address that matches nobody, so the reply is the same
      // "invalid email or password" as a wrong password and reveals nothing.
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-in/email") return;
        const typed = String((ctx.body as { email?: unknown } | undefined)?.email ?? "").trim();
        const kind = identifierKind(typed);
        if (!typed || kind === "email") return;
        const where =
          kind === "uid" ? { uid: normalizeUid(typed) } : { username: normalizeUsername(typed) };
        const found = await getDb().user.findUnique({ where, select: { email: true } });
        return {
          context: { body: { ...ctx.body, email: found?.email ?? "no-account@invalid.invalid" } },
        };
      }),
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
