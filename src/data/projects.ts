import "server-only";
import { z } from "zod";
import type { Programme } from "@/content/research";
import type { Project } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { getProjectAccessBySlug, type ProjectAccess } from "@/lib/project-access";
import { requireMember } from "@/lib/session";

// Workspace project data. Not cached: what each member may see depends on who
// they are, and every function checks access before reading details.

const termValue = z.array(z.object({ term: z.string(), value: z.string() }));
const json = {
  whyItMatters: z.array(z.string()),
  subQuestions: z.array(z.object({ id: z.string(), question: z.string(), hypothesis: z.string() })),
  design: termValue,
  dataSources: z.array(z.object({ need: z.string(), source: z.string(), role: z.string() })),
  approach: z.array(z.object({ title: z.string(), detail: z.string() })),
  scopes: z.array(z.object({ plan: z.string(), scope: z.string(), why: z.string() })),
  stages: z.array(z.object({ name: z.string(), detail: z.string() })),
  outputs: z.array(z.string()),
  commitments: z.array(z.string()),
  highlights: termValue,
};

export function toProgramme(row: Project): Programme {
  return {
    slug: row.slug,
    number: row.number,
    label: row.label,
    title: row.title,
    status: row.statusLabel,
    lastUpdated: row.lastUpdated.toISOString().slice(0, 10),
    leads: row.leads,
    areas: row.areas,
    summary: row.summary,
    question: row.question,
    whyItMatters: json.whyItMatters.parse(row.whyItMatters),
    subQuestions: json.subQuestions.parse(row.subQuestions),
    design: json.design.parse(row.design),
    dataSources: json.dataSources.parse(row.dataSources),
    approach: json.approach.parse(row.approach),
    scopes: json.scopes.parse(row.scopes),
    stages: json.stages.parse(row.stages),
    currentStage: row.currentStage,
    outputs: json.outputs.parse(row.outputs),
    commitments: json.commitments.parse(row.commitments),
    highlights: json.highlights.parse(row.highlights),
    isFeatured: row.isFeatured,
  };
}

/** What every member may see about a project: nothing from the research itself. */
export type ProjectSummary = {
  id: string;
  slug: string;
  number: string;
  title: string;
  statusLabel: string;
  stages: string[];
  currentStage: number;
  leaderName: string | null;
  teamSize: number;
  isMine: boolean;
  canView: boolean;
};

export async function getProjectList(): Promise<ProjectSummary[]> {
  const user = await requireMember("/workspace");
  const rows = await getDb().project.findMany({
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      slug: true,
      number: true,
      title: true,
      statusLabel: true,
      stages: true,
      currentStage: true,
      leaderId: true,
      leader: { select: { name: true } },
      memberships: { select: { userId: true } },
    },
  });
  return rows.map((r) => {
    const isMine = r.leaderId === user.id || r.memberships.some((m) => m.userId === user.id);
    return {
      id: r.id,
      slug: r.slug,
      number: r.number,
      title: r.title,
      statusLabel: r.statusLabel,
      stages: json.stages.parse(r.stages).map((s) => s.name),
      currentStage: r.currentStage,
      leaderName: r.leader?.name ?? null,
      teamSize: r.memberships.length,
      isMine,
      canView: isMine || user.role === "admin",
    };
  });
}

export type TeamMemberRow = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  isLeader: boolean;
};

export type InviteRow = {
  id: string;
  role: string;
  note: string | null;
  expiresAt: string;
  createdBy: string | null;
};

export type ProjectDetail =
  | { kind: "missing" }
  | { kind: "restricted"; title: string; number: string; leaderName: string | null }
  | {
      kind: "full";
      access: ProjectAccess;
      programme: Programme;
      leaderName: string | null;
      team: TeamMemberRow[];
      invites: InviteRow[];
    };

/** Full details for the project's team and admins; a title-only view for other members. */
export async function getProjectDetail(slug: string): Promise<ProjectDetail> {
  const access = await getProjectAccessBySlug(slug);
  if (!access) return { kind: "missing" };

  const db = getDb();
  if (!access.canView) {
    const p = await db.project.findUnique({
      where: { id: access.projectId },
      select: { title: true, number: true, leader: { select: { name: true } } },
    });
    return {
      kind: "restricted",
      title: p?.title ?? access.title,
      number: p?.number ?? "",
      leaderName: p?.leader?.name ?? null,
    };
  }

  const row = await db.project.findUniqueOrThrow({
    where: { id: access.projectId },
    include: {
      leader: { select: { name: true } },
      memberships: {
        orderBy: { joinedAt: "asc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  // Open invites only for people who can manage the team.
  const invites = access.canManage
    ? await db.projectInvite.findMany({
        where: {
          projectId: access.projectId,
          acceptedAt: null,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { name: true } } },
      })
    : [];

  const team = row.memberships
    .map((m) => ({
      membershipId: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      isLeader: m.user.id === row.leaderId,
    }))
    .sort((a, b) => Number(b.isLeader) - Number(a.isLeader));

  return {
    kind: "full",
    access,
    programme: toProgramme(row),
    leaderName: row.leader?.name ?? null,
    team,
    invites: invites.map((i) => ({
      id: i.id,
      role: i.role,
      note: i.note,
      expiresAt: i.expiresAt.toISOString(),
      createdBy: i.createdBy?.name ?? null,
    })),
  };
}

/** Members and admins who are not on the project yet (for the "add member" list). */
export async function getAddableMembers(access: ProjectAccess) {
  if (!access.canManage) return [];
  return getDb().user.findMany({
    where: {
      role: { in: ["member", "admin"] },
      memberships: { none: { projectId: access.projectId } },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
}
