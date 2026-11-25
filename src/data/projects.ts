import "server-only";
import { z } from "zod";
import type { Programme } from "@/content/research";
import type { Project } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import type { Position } from "@/lib/project-rules";
import { getProjectAccessBySlug, slotUsage, type ProjectAccess } from "@/lib/project-access";
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
  slots: number;
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
      slots: true,
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
      slots: r.slots,
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
  /** leader, co_leader or member. */
  position: Position;
  /** The leader's 1–5 rating for this project, or null. Visible to the team. */
  rating: number | null;
};

export type InviteRow = {
  id: string;
  role: string;
  position: Position;
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
      slots: { slots: number; members: number; invites: number; used: number; free: number };
      /** Slot requests: the open one (if any) and the last decision. */
      slotRequest: SlotRequestRow | null;
      lastDecision: SlotRequestRow | null;
    };

export type SlotRequestRow = {
  id: string;
  extra: number;
  reason: string;
  status: "pending" | "approved" | "declined" | "cancelled";
  adminNote: string | null;
  createdAt: string;
  decidedAt: string | null;
};

const rank: Record<Position, number> = { leader: 0, co_leader: 1, member: 2 };

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

  // Open invites for the people who run the team; slot details for everyone on it.
  const invites = access.canRunTeam
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
      position: (m.user.id === row.leaderId ? "leader" : m.position) as Position,
      rating: m.rating,
    }))
    .sort((a, b) => rank[a.position] - rank[b.position]);

  const [usage, requests] = await Promise.all([
    slotUsage(access.projectId),
    db.projectSlotRequest.findMany({
      where: { projectId: access.projectId, status: { not: "cancelled" } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);
  const toRequest = (r: (typeof requests)[number]): SlotRequestRow => ({
    id: r.id,
    extra: r.extra,
    reason: r.reason,
    status: r.status,
    adminNote: r.adminNote,
    createdAt: r.createdAt.toISOString(),
    decidedAt: r.decidedAt?.toISOString() ?? null,
  });
  const open = requests.find((r) => r.status === "pending");
  const decided = requests.find((r) => r.status !== "pending");

  return {
    kind: "full",
    access,
    programme: toProgramme(row),
    leaderName: row.leader?.name ?? null,
    team,
    slots: usage,
    slotRequest: open ? toRequest(open) : null,
    lastDecision: decided ? toRequest(decided) : null,
    invites: invites.map((i) => ({
      id: i.id,
      role: i.role,
      position: i.position,
      note: i.note,
      expiresAt: i.expiresAt.toISOString(),
      createdBy: i.createdBy?.name ?? null,
    })),
  };
}

/** Members and admins who are not on the project yet (for the "add member" list). */
export async function getAddableMembers(access: ProjectAccess) {
  if (!access.canRunTeam) return [];
  return getDb().user.findMany({
    where: {
      role: { in: ["member", "admin"] },
      memberships: { none: { projectId: access.projectId } },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
}

/** A project's editable content, for its leader and admins only. */
export async function getProjectForEdit(slug: string) {
  const access = await getProjectAccessBySlug(slug);
  if (!access) return { kind: "missing" as const };
  if (!access.canRunTeam) return { kind: "forbidden" as const, title: access.title };
  const row = await getDb().project.findUniqueOrThrow({ where: { id: access.projectId } });
  return { kind: "ok" as const, access, programme: toProgramme(row), status: row.status };
}
