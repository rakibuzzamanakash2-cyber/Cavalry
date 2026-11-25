import "server-only";
import { getDb } from "./db";
import { requireMember, type CurrentUser } from "./session";

// Who may do what with a project (ADR 0004, 0011):
// - Any member can see that a project exists (title, leader, stage).
// - Only the project's team (and admins) can see its details.
// - Leader and admins: everything, including leadership, co-leaders,
//   ratings and inviting someone as co-leader or leader.
// - Co-leaders: run the team day to day: add and remove members, set their
//   roles, invite members and edit the research plan.
// - Only the leader asks admins for more slots; admins set slots directly.

export type ProjectAccess = {
  user: CurrentUser;
  projectId: string;
  slug: string;
  title: string;
  leaderId: string | null;
  isAdmin: boolean;
  isLeader: boolean;
  isCoLeader: boolean;
  isTeamMember: boolean;
  myRole: string | null;
  canView: boolean;
  /** Leader or admin. */
  canManage: boolean;
  /** Leader, co-leader or admin. */
  canRunTeam: boolean;
  /** The leader only (admins change slots directly). */
  canRequestSlots: boolean;
};

type Mine = { role: string; position: string } | undefined;

function decide(
  user: CurrentUser,
  p: { id: string; slug: string; title: string; leaderId: string | null },
  mine: Mine,
): ProjectAccess {
  const isAdmin = user.role === "admin";
  const isLeader = p.leaderId === user.id;
  const isCoLeader = !isLeader && mine?.position === "co_leader";
  const isTeamMember = Boolean(mine) || isLeader;
  return {
    user,
    projectId: p.id,
    slug: p.slug,
    title: p.title,
    leaderId: p.leaderId,
    isAdmin,
    isLeader,
    isCoLeader,
    isTeamMember,
    myRole: mine?.role ?? null,
    canView: isAdmin || isTeamMember,
    canManage: isAdmin || isLeader,
    canRunTeam: isAdmin || isLeader || isCoLeader,
    canRequestSlots: isLeader,
  };
}

const projectSelect = (userId: string) =>
  ({
    id: true,
    slug: true,
    title: true,
    leaderId: true,
    memberships: { where: { userId }, select: { role: true, position: true } },
  }) as const;

/** Access for the signed-in member to a project by slug; null if it doesn't exist. */
export async function getProjectAccessBySlug(slug: string): Promise<ProjectAccess | null> {
  const user = await requireMember(`/workspace/projects/${slug}`);
  const p = await getDb().project.findUnique({ where: { slug }, select: projectSelect(user.id) });
  if (!p) return null;
  return decide(user, p, p.memberships[0]);
}

/** Same, by id (used by server actions, which receive ids from forms). */
export async function getProjectAccessById(id: string): Promise<ProjectAccess | null> {
  const user = await requireMember("/workspace");
  const p = await getDb().project.findUnique({ where: { id }, select: projectSelect(user.id) });
  if (!p) return null;
  return decide(user, p, p.memberships[0]);
}

/** Team slots in use: people on the team plus open invites (each holds a slot). */
export async function slotUsage(projectId: string) {
  const db = getDb();
  const [project, members, invites] = await Promise.all([
    db.project.findUnique({ where: { id: projectId }, select: { slots: true } }),
    db.projectMembership.count({ where: { projectId } }),
    db.projectInvite.count({
      where: { projectId, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
    }),
  ]);
  const slots = project?.slots ?? 0;
  return { slots, members, invites, used: members + invites, free: slots - members - invites };
}
