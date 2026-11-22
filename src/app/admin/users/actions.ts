"use server";

import { refresh } from "next/cache";
import { getDb } from "@/lib/db";
import { ROLES, type Role } from "@/lib/roles";
import { requireAdmin } from "@/lib/session";

export type RoleActionState = { ok: boolean; message: string } | null;

/** Change a user's platform role. Admins only, re-checked here on every call. */
export async function setUserRole(
  _prev: RoleActionState,
  formData: FormData,
): Promise<RoleActionState> {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as Role;

  if (!ROLES.includes(role)) return { ok: false, message: "Unknown role." };
  if (userId === admin.id) {
    return { ok: false, message: "You can't change your own role." };
  }

  const db = getDb();
  const target = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) return { ok: false, message: "User not found." };

  await db.user.update({ where: { id: userId }, data: { role } });
  // Sign them out everywhere so the new role applies on their next request.
  await db.session.deleteMany({ where: { userId } });

  refresh();
  return { ok: true, message: "Role updated." };
}
