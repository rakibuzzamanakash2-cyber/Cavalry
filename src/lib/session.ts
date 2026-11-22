import "server-only";
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAuth } from "./auth";
import { isMemberRole, toRole, type Role } from "./roles";

// Data Access Layer for the signed-in user. Every check that decides what
// someone may see goes through these functions, on the server.
// Reading the session is request data: call these only inside <Suspense>.

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
};

/** The signed-in user, or null. Deduplicated per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Session checks compare expiry times against the clock, so mark this as
  // request-time work before reading it.
  await connection();
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image ?? null,
    role: toRole((u as { role?: unknown }).role),
  };
});

/** Signed in, or sent to the sign-in page (coming back to `next` afterwards). */
export async function requireUser(next = "/"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return user;
}

/** Members and admins only; signed-in users without membership see /members-only. */
export async function requireMember(next = "/workspace"): Promise<CurrentUser> {
  const user = await requireUser(next);
  if (!isMemberRole(user.role)) redirect("/members-only");
  return user;
}

/** Admins only. */
export async function requireAdmin(next = "/admin/users"): Promise<CurrentUser> {
  const user = await requireUser(next);
  if (user.role !== "admin") redirect("/members-only");
  return user;
}
