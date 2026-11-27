// Grouping, sorting and searching people for the user and team lists.
// Kept free of server-only imports so tests can use it.
import type { Role } from "./roles";

/** Admin first, then project leaders (and co-leaders), members, signed-in users. */
export const TIERS = ["admin", "leader", "member", "user"] as const;
export type Tier = (typeof TIERS)[number];

export const tierLabel: Record<Tier, string> = {
  admin: "Admin",
  leader: "Leader",
  member: "Member",
  user: "User",
};

export const tierPlural: Record<Tier, string> = {
  admin: "Admins",
  leader: "Leaders",
  member: "Members",
  user: "Users",
};

/** leads: leads or co-leads at least one project. */
export function tierOf(role: Role, leads: boolean): Tier {
  if (role === "admin") return "admin";
  if (role === "member") return leads ? "leader" : "member";
  return "user";
}

export function toTierFilter(value: unknown): Tier | "all" {
  return TIERS.includes(value as Tier) ? (value as Tier) : "all";
}

export function cleanQuery(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}

/** Case-insensitive match on any field; an empty query matches everyone. */
export function matchesQuery(query: string, fields: (string | null | undefined)[]) {
  const q = query.toLowerCase().replace(/^@/, "");
  if (!q) return true;
  return fields.some((f) => f?.toLowerCase().includes(q));
}

export function byTierThenName<T extends { tier: Tier; name: string }>(a: T, b: T) {
  return TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) || a.name.localeCompare(b.name);
}

export function countTiers(list: { tier: Tier }[]) {
  const counts: Record<Tier, number> = { admin: 0, leader: 0, member: 0, user: 0 };
  for (const p of list) counts[p.tier]++;
  return counts;
}
