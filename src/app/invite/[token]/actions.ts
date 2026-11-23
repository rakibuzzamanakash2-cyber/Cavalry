"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { hashInviteToken } from "@/lib/invite-token";
import { requireUser } from "@/lib/session";

export type AcceptState = { ok: false; message: string } | null;

/**
 * Accept a project invite. The invite is claimed atomically, so a link can be
 * used once. Plain users become members; admins and members keep their role.
 */
export async function acceptInvite(_prev: AcceptState, formData: FormData): Promise<AcceptState> {
  const token = String(formData.get("token") ?? "");
  const user = await requireUser(`/invite/${token}`);
  const db = getDb();

  const slug = await db.$transaction(async (tx) => {
    const invite = await tx.projectInvite.findUnique({
      where: { tokenHash: hashInviteToken(token) },
      select: { id: true, projectId: true, role: true, project: { select: { slug: true } } },
    });
    if (!invite) return null;

    const claimed = await tx.projectInvite.updateMany({
      where: { id: invite.id, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
      data: { acceptedAt: new Date(), acceptedById: user.id },
    });
    if (claimed.count !== 1) return null;

    await tx.user.updateMany({ where: { id: user.id, role: "user" }, data: { role: "member" } });
    await tx.projectMembership.upsert({
      where: { projectId_userId: { projectId: invite.projectId, userId: user.id } },
      create: { projectId: invite.projectId, userId: user.id, role: invite.role },
      update: {},
    });
    return invite.project.slug;
  });

  if (!slug)
    return { ok: false, message: "This invite link has already been used or has expired." };
  redirect(`/workspace/projects/${slug}`);
}
