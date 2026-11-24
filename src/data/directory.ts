import "server-only";
import { getDb } from "@/lib/db";
import { averageRating } from "@/lib/ratings";
import { roleLabel, toRole } from "@/lib/roles";
import { requireMember } from "@/lib/session";

// The internal team directory: every member, their projects and roles, and an
// overall rating (the average of the 1–5 ratings their project leaders gave).
// Members only. Per-project ratings stay on each project's team page.

export type DirectoryPerson = {
  id: string;
  name: string;
  platformRole: string;
  memberSince: string;
  isYou: boolean;
  overall: number | null;
  ratedCount: number;
  projects: {
    slug: string;
    number: string;
    title: string;
    role: string;
    isLeader: boolean;
    canView: boolean;
  }[];
};

export type DirectoryTeam = {
  id: string;
  slug: string;
  number: string;
  title: string;
  statusLabel: string;
  leaderName: string | null;
  canView: boolean;
  members: { userId: string; name: string; role: string; isLeader: boolean }[];
};

export async function getTeamDirectory(): Promise<{
  people: DirectoryPerson[];
  teams: DirectoryTeam[];
}> {
  const viewer = await requireMember("/workspace/team");
  const db = getDb();
  const [users, projects] = await Promise.all([
    db.user.findMany({
      where: { role: { in: ["member", "admin"] } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
        memberships: {
          orderBy: { joinedAt: "asc" },
          select: {
            role: true,
            rating: true,
            project: {
              select: { id: true, slug: true, number: true, title: true, leaderId: true },
            },
          },
        },
      },
    }),
    db.project.findMany({
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        slug: true,
        number: true,
        title: true,
        statusLabel: true,
        leaderId: true,
        leader: { select: { name: true } },
        memberships: {
          orderBy: { joinedAt: "asc" },
          select: { role: true, user: { select: { id: true, name: true } } },
        },
      },
    }),
  ]);

  const isAdmin = viewer.role === "admin";
  const myProjects = new Set(
    projects
      .filter((p) => p.leaderId === viewer.id || p.memberships.some((m) => m.user.id === viewer.id))
      .map((p) => p.id),
  );
  const canView = (projectId: string) => isAdmin || myProjects.has(projectId);

  const people = users.map((u) => {
    const ratings = u.memberships.map((m) => m.rating);
    return {
      id: u.id,
      name: u.name,
      platformRole: roleLabel[toRole(u.role)],
      memberSince: u.createdAt.toISOString(),
      isYou: u.id === viewer.id,
      overall: averageRating(ratings),
      ratedCount: ratings.filter((r) => r !== null).length,
      projects: u.memberships.map((m) => ({
        slug: m.project.slug,
        number: m.project.number,
        title: m.project.title,
        role: m.role,
        isLeader: m.project.leaderId === u.id,
        canView: canView(m.project.id),
      })),
    };
  });

  const teams = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    number: p.number,
    title: p.title,
    statusLabel: p.statusLabel,
    leaderName: p.leader?.name ?? null,
    canView: canView(p.id),
    members: p.memberships
      .map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        role: m.role,
        isLeader: m.user.id === p.leaderId,
      }))
      .sort((a, b) => Number(b.isLeader) - Number(a.isLeader)),
  }));

  return { people, teams };
}
