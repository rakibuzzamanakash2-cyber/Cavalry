"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { hashInviteToken } from "@/lib/invite-token";
import { requireUser } from "@/lib/session";

export type AcceptState = { ok: false; message: string } | null;

class TeamFull extends Error {}

/**
 * Accept a project invite. The invite is claimed atomically, so a link can be
 * used once. Plain users become members; admins and members keep their role.
 */
export async function acceptInvite(_prev: AcceptState, formData: FormData): Promise<AcceptState> {
  const token = String(formData.get("token") ?? "");
  const user = await requireUser(`/invite/${token}`);
  const db = getDb();

  let slug: string | null;
  try {
    slug = await db.$transaction(async (tx) => {
      const invite = await tx.projectInvite.findUnique({
        where: { tokenHash: hashInviteToken(token) },
        select: {
          id: true,
          projectId: true,
          role: true,
          position: true,
          project: { select: { slug: true, slots: true } },
        },
      });
      if (!invite) return null;

      const claimed = await tx.projectInvite.updateMany({
        where: { id: invite.id, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
        data: { acceptedAt: new Date(), acceptedById: user.id },
      });
      if (claimed.count !== 1) return null;

      // The invite held a slot; still refuse if the team is somehow over its limit.
      const onTeam = await tx.projectMembership.count({ where: { projectId: invite.projectId } });
      if (onTeam >= invite.project.slots) throw new TeamFull();

      await tx.user.updateMany({ where: { id: user.id, role: "user" }, data: { role: "member" } });
      await tx.projectMembership.upsert({
        where: { projectId_userId: { projectId: invite.projectId, userId: user.id } },
        create: {
          projectId: invite.projectId,
          userId: user.id,
          role: invite.role,
          position: invite.position === "co_leader" ? "co_leader" : "member",
        },
        update: {},
      });
      // A leader invite hands the project over; the old leader stays on the team.
      if (invite.position === "leader") {
        await tx.project.update({ where: { id: invite.projectId }, data: { leaderId: user.id } });
      }
      return invite.project.slug;
    });
  } catch (error) {
    if (error instanceof TeamFull) {
      return { ok: false, message: "This team is full. Ask the leader to free a slot." };
    }
    throw error;
  }

  if (!slug)
    return { ok: false, message: "This invite link has already been used or has expired." };
  redirect(`/workspace/projects/${slug}`);
}
