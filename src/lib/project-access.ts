import "server-only";
import { getDb } from "./db";
import { requireMember, type CurrentUser } from "./session";

// Who may do what with a project. Rules (see ADR 0004):
// - Any member can see that a project exists (title, leader, stage).
// - Only the project's team (and admins) can see its details.
// - Only the leader (and admins) can manage the team, roles and invites.

export type ProjectAccess = {
  user: CurrentUser;
  projectId: string;
  slug: string;
  title: string;
  leaderId: string | null;
  isAdmin: boolean;
  isLeader: boolean;
  isTeamMember: boolean;
  myRole: string | null;
  canView: boolean;
  canManage: boolean;
};

function decide(
  user: CurrentUser,
  p: { id: string; slug: string; title: string; leaderId: string | null },
  myRole: string | null,
): ProjectAccess {
  const isAdmin = user.role === "admin";
  const isLeader = p.leaderId === user.id;
  const isTeamMember = myRole !== null || isLeader;
  return {
    user,
    projectId: p.id,
    slug: p.slug,
    title: p.title,
    leaderId: p.leaderId,
    isAdmin,
    isLeader,
    isTeamMember,
    myRole,
    canView: isAdmin || isTeamMember,
    canManage: isAdmin || isLeader,
  };
}

const projectSelect = (userId: string) =>
  ({
    id: true,
    slug: true,
    title: true,
    leaderId: true,
    memberships: { where: { userId }, select: { role: true } },
  }) as const;

/** Access for the signed-in member to a project by slug; null if it doesn't exist. */
export async function getProjectAccessBySlug(slug: string): Promise<ProjectAccess | null> {
  const user = await requireMember(`/workspace/projects/${slug}`);
  const p = await getDb().project.findUnique({ where: { slug }, select: projectSelect(user.id) });
  if (!p) return null;
  return decide(user, p, p.memberships[0]?.role ?? null);
}

/** Same, by id (used by server actions, which receive ids from forms). */
export async function getProjectAccessById(id: string): Promise<ProjectAccess | null> {
  const user = await requireMember("/workspace");
  const p = await getDb().project.findUnique({ where: { id }, select: projectSelect(user.id) });
  if (!p) return null;
  return decide(user, p, p.memberships[0]?.role ?? null);
}
