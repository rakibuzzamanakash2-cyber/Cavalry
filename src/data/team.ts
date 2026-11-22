import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { OpenRole, Person } from "@/content/team";
import { getDb } from "@/lib/db";

export async function getPeople(): Promise<Person[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("team");
  const rows = await getDb().teamMember.findMany({
    where: { isActive: true },
    orderBy: [{ isFounder: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    role: r.role,
    focus: r.focus,
    bio: r.bio,
    photo: r.photoUrl ?? undefined,
    isFounder: r.isFounder,
    links: [
      r.linkedinUrl ? { label: "LinkedIn", href: r.linkedinUrl } : null,
      r.githubUrl ? { label: "GitHub", href: r.githubUrl } : null,
      r.scholarUrl ? { label: "Google Scholar", href: r.scholarUrl } : null,
    ].filter((l): l is { label: string; href: string } => l !== null),
  }));
}

export async function getOpenRoles(): Promise<OpenRole[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("team");
  const rows = await getDb().openRole.findMany({
    where: { isOpen: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    background: r.background,
    owns: r.owns,
  }));
}
