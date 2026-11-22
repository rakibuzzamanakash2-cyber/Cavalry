// Platform roles. Kept free of server-only imports so scripts and tests can use it.

export const ROLES = ["user", "member", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const roleLabel: Record<Role, string> = {
  user: "Signed-in user",
  member: "Member",
  admin: "Admin",
};

export function toRole(value: unknown): Role {
  return ROLES.includes(value as Role) ? (value as Role) : "user";
}

/** Members and admins can see the private workspace. */
export function isMemberRole(role: Role) {
  return role === "member" || role === "admin";
}

export function isAdminEmail(email: string) {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}
