import "server-only";
import { getDb } from "@/lib/db";
import { hashInviteToken } from "@/lib/invite-token";
import { requireUser } from "@/lib/session";

export type InviteView =
  | { kind: "invalid" }
  | { kind: "already"; slug: string; title: string }
  | {
      kind: "open";
      title: string;
      number: string;
      role: string;
      position: "member" | "co_leader" | "leader";
      invitedBy: string | null;
    };

/**
 * What the invite page may show: the project title, the role and who sent it.
 * Nothing from the research itself until the invite is accepted.
 */
export async function getInvite(token: string): Promise<InviteView> {
  const user = await requireUser(`/invite/${token}`);
  const invite = await getDb().projectInvite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    include: {
      createdBy: { select: { name: true } },
      project: {
        select: {
          slug: true,
          title: true,
          number: true,
          leaderId: true,
          memberships: { where: { userId: user.id }, select: { id: true } },
        },
      },
    },
  });
  if (!invite) return { kind: "invalid" };
  const p = invite.project;
  if (p.memberships.length > 0 || p.leaderId === user.id) {
    return { kind: "already", slug: p.slug, title: p.title };
  }
  if (invite.acceptedAt || invite.revokedAt || invite.expiresAt <= new Date()) {
    return { kind: "invalid" };
  }
  return {
    kind: "open",
    title: p.title,
    number: p.number,
    role: invite.role,
    position: invite.position,
    invitedBy: invite.createdBy?.name ?? null,
  };
}
