import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";
import { getDb } from "./db";
import { identifierKind, normalizeUid, normalizeUsername, usernameProblem } from "./identity";
import { sendAccountCreated } from "./mail/account-created";
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
      // Same limits as Ru'sAuth: at least 8 characters, at most 72 (bcrypt's limit).
      minPasswordLength: 8,
      maxPasswordLength: 72,
      autoSignIn: true,
    },
    socialProviders: google,
    user: {
      additionalFields: {
        // Never settable from sign-up forms; changed only by admins.
        role: { type: "string", defaultValue: "user", input: false, required: false },
        // Given by the database at sign-up; never set from forms.
        uid: { type: "string", input: false, required: false },
        // Chosen at sign-up (checked in the before hook) or on the account page.
        username: { type: "string", input: true, required: false },
      },
    },
    hooks: {
      // The sign-in form takes an email, a username or a UID. Before the normal
      // password check, swap a username or UID for the account's email. Unknown
      // names become an address that matches nobody, so the reply is the same
      // "invalid email or password" as a wrong password and reveals nothing.
      before: createAuthMiddleware(async (ctx) => {
        const body = (ctx.body ?? {}) as Record<string, unknown>;

        // Sign-up: check the username (format and free) before the account exists.
        if (ctx.path === "/sign-up/email") {
          if (body.username === undefined || body.username === "") return;
          const username = normalizeUsername(String(body.username));
          const problem = usernameProblem(username);
          if (problem) throw new APIError("BAD_REQUEST", { message: `Username: ${problem}` });
          const taken = await getDb().user.findUnique({
            where: { username },
            select: { id: true },
          });
          if (taken) {
            throw new APIError("BAD_REQUEST", { message: "That username is taken. Try another." });
          }
          return { context: { body: { ...body, username } } };
        }

        // The username is changed only on the account page, which checks it.
        // (Hook results are merged into the request, so refuse rather than strip.)
        if (ctx.path === "/update-user" && body.username !== undefined) {
          throw new APIError("BAD_REQUEST", {
            message: "Change your username on the account page.",
          });
        }

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
          // Every new account (email or Google) gets a confirmation email.
          // Mail problems are logged and never stop the sign-up.
          after: async (user) => {
            const send = async () => {
              const row = await getDb().user.findUnique({
                where: { id: user.id },
                select: { name: true, email: true, uid: true },
              });
              if (row) await sendAccountCreated(row);
            };
            // Send after the response so sign-up isn't slowed by the mail server.
            try {
              after(send);
            } catch {
              await send();
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
