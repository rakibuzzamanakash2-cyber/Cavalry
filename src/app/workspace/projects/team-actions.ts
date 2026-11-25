"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { newInviteToken } from "@/lib/invite-token";
import { getProjectAccessById, slotUsage, type ProjectAccess } from "@/lib/project-access";
import { SLOTS_MAX } from "@/lib/project-rules";
import { ratingSchema } from "@/lib/ratings";
import type { ActionState } from "./actions";

// Team actions (ADR 0004, 0011). Every action re-checks permissions here:
// - leader/admin ("manage"): leadership, co-leaders, ratings, inviting or
//   adding someone as co-leader or leader;
// - co-leaders ("run"): add/remove members, members' roles, member invites;
// - leader only: ask for more slots. Admins set slots directly.

const roleText = z
  .string()
  .trim()
  .min(2, "Give the role a name (at least 2 characters).")
  .max(60, "Keep the role under 60 characters.");

const positionSchema = z.enum(["member", "co_leader", "leader"], { error: "Choose a position." });

/** A uuid from the form, or "" (ids are uuid columns: bad input must not reach the query). */
function formId(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "");
  return z.uuid().safeParse(value).success ? value : "";
}

type Level = "run" | "manage";
type Check = { ok: false; error: string } | { ok: true; access: ProjectAccess };

async function check(projectId: string, level: Level): Promise<Check> {
  if (!projectId) return { ok: false, error: "Project not found." };
  const access = await getProjectAccessById(projectId);
  if (!access) return { ok: false, error: "Project not found." };
  if (level === "manage" && !access.canManage) {
    return { ok: false, error: "Only the project leader or an admin can do that." };
  }
  if (level === "run" && !access.canRunTeam) {
    return { ok: false, error: "Only the leader, a co-leader or an admin can do that." };
  }
  return { ok: true, access };
}

const fail = (message: string): ActionState => ({ ok: false, message });

async function membershipById(id: string) {
  if (!id) return null;
  return getDb().projectMembership.findUnique({
    where: { id },
    select: {
      id: true,
      projectId: true,
      userId: true,
      position: true,
      project: { select: { leaderId: true } },
    },
  });
}

/** Co-leaders may act on plain members only; leader and admins on anyone. */
function canTouch(
  access: ProjectAccess,
  m: { userId: string; position: string },
  leaderId: string | null,
) {
  if (m.userId === leaderId) return access.canManage;
  if (m.position === "co_leader") return access.canManage;
  return access.canRunTeam;
}

/** Hand the project to someone already on the team; the old leader stays as a member. */
async function transferLeadership(projectId: string, toUserId: string) {
  await getDb().$transaction([
    getDb().project.update({ where: { id: projectId }, data: { leaderId: toUserId } }),
    getDb().projectMembership.updateMany({
      where: { projectId, userId: toUserId },
      data: { position: "member" },
    }),
  ]);
}

/** Add an existing member, as member, co-leader or the new leader. */
export async function addMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const projectId = formId(formData, "projectId");
  const position = positionSchema.safeParse(formData.get("position") ?? "member");
  if (!position.success) return fail("Choose a position.");
  const c = await check(projectId, position.data === "member" ? "run" : "manage");
  if (!c.ok) return fail(c.error);

  const role = roleText.safeParse(formData.get("role"));
  if (!role.success) return fail(role.error.issues[0]?.message ?? "Invalid role.");
  const userId = String(formData.get("userId") ?? "").slice(0, 100);
  if (!userId) return fail("Choose a member.");

  const db = getDb();
  const target = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target || !["member", "admin"].includes(target.role)) {
    return fail("Only members can be added. Use an invite link for others.");
  }
  const existing = await db.projectMembership.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { id: true },
  });
  if (existing) return fail("They are already on this project.");

  const usage = await slotUsage(projectId);
  if (usage.free < 1) {
    return fail(`All ${usage.slots} slots are in use. Free one, or ask for more slots.`);
  }

  await db.projectMembership.create({
    data: {
      projectId,
      userId,
      role: role.data,
      position: position.data === "co_leader" ? "co_leader" : "member",
    },
  });
  if (position.data === "leader") await transferLeadership(projectId, userId);
  refresh();
  return {
    ok: true,
    message: position.data === "leader" ? "Added as the new leader." : "Member added.",
  };
}

/** Change someone's project role. Co-leaders: members only. */
export async function updateMemberRole(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const m = await membershipById(formId(formData, "membershipId"));
  if (!m) return fail("Team member not found.");
  const c = await check(m.projectId, "run");
  if (!c.ok) return fail(c.error);
  if (!canTouch(c.access, m, m.project.leaderId)) {
    return fail("Only the leader or an admin can change this person's role.");
  }
  const role = roleText.safeParse(formData.get("role"));
  if (!role.success) return fail(role.error.issues[0]?.message ?? "Invalid role.");
  await getDb().projectMembership.update({ where: { id: m.id }, data: { role: role.data } });
  refresh();
  return { ok: true, message: "Role updated." };
}

/** Make someone a co-leader, or a member again. Leader or admin only. */
export async function setPosition(formData: FormData): Promise<void> {
  const m = await membershipById(formId(formData, "membershipId"));
  if (!m) return;
  const c = await check(m.projectId, "manage");
  if (!c.ok || m.userId === m.project.leaderId) return;
  const position = z.enum(["member", "co_leader"]).safeParse(formData.get("position"));
  if (!position.success) return;
  await getDb().projectMembership.update({
    where: { id: m.id },
    data: { position: position.data },
  });
  refresh();
}

/** Rate someone's work on this project, 1–5. Leader or admin, never yourself. */
export async function rateMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const m = await membershipById(formId(formData, "membershipId"));
  if (!m) return fail("Team member not found.");
  const c = await check(m.projectId, "manage");
  if (!c.ok) return fail(c.error);
  if (m.userId === c.access.user.id) {
    return fail("You can't rate yourself. An admin rates the team leader.");
  }
  const rating = ratingSchema.safeParse(formData.get("rating"));
  if (!rating.success) return fail(rating.error.issues[0]?.message ?? "Invalid rating.");
  await getDb().projectMembership.update({
    where: { id: m.id },
    data: { rating: rating.data, ratedAt: new Date(), ratedById: c.access.user.id },
  });
  refresh();
  return { ok: true, message: "Rating saved." };
}

/** Remove someone (never the leader). Co-leaders: members only. */
export async function removeMember(formData: FormData): Promise<void> {
  const m = await membershipById(formId(formData, "membershipId"));
  if (!m || m.userId === m.project.leaderId) return; // hand over leadership first
  const c = await check(m.projectId, "run");
  if (!c.ok || !canTouch(c.access, m, m.project.leaderId)) return;
  await getDb().projectMembership.delete({ where: { id: m.id } });
  refresh();
}

/** Make a team member the leader. Current leader or admin only. */
export async function makeLeader(formData: FormData): Promise<void> {
  const m = await membershipById(formId(formData, "membershipId"));
  if (!m || m.userId === m.project.leaderId) return;
  const c = await check(m.projectId, "manage");
  if (!c.ok) return;
  await transferLeadership(m.projectId, m.userId);
  refresh();
}

const inviteSchema = z.object({
  projectId: z.uuid(),
  role: roleText,
  position: positionSchema.default("member"),
  note: z.string().trim().max(200).optional().default(""),
});

/** One-time invite link (7 days). Each open invite holds a slot. */
export async function createInvite(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input.");
  const { projectId, role, position, note } = parsed.data;
  const c = await check(projectId, position === "member" ? "run" : "manage");
  if (!c.ok) return fail(c.error);

  const usage = await slotUsage(projectId);
  if (usage.free < 1) {
    return fail(`All ${usage.slots} slots are in use (open invites count too).`);
  }

  const { token, hash } = newInviteToken();
  await getDb().projectInvite.create({
    data: {
      projectId,
      tokenHash: hash,
      role,
      position,
      note: note || null,
      createdById: c.access.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  refresh();
  return {
    ok: true,
    message:
      position === "leader"
        ? "Invite link created. Whoever accepts it becomes the leader. Copy it now: it is shown only once."
        : "Invite link created. Copy it now: it is shown only once.",
    inviteLink: `/invite/${token}`,
  };
}

/** Revoke an unused invite. Co-leaders: member invites only. */
export async function revokeInvite(formData: FormData): Promise<void> {
  const inviteId = formId(formData, "inviteId");
  if (!inviteId) return;
  const db = getDb();
  const invite = await db.projectInvite.findUnique({
    where: { id: inviteId },
    select: { projectId: true, position: true },
  });
  if (!invite) return;
  const c = await check(invite.projectId, invite.position === "member" ? "run" : "manage");
  if (!c.ok) return;
  await db.projectInvite.update({ where: { id: inviteId }, data: { revokedAt: new Date() } });
  refresh();
}

/** The leader asks admins for more slots (up to 10 in total). */
export async function requestSlots(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const projectId = formId(formData, "projectId");
  const access = projectId ? await getProjectAccessById(projectId) : null;
  if (!access) return fail("Project not found.");
  if (!access.canRequestSlots) return fail("Only the project leader can ask for more slots.");

  const db = getDb();
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { slots: true },
  });
  const room = SLOTS_MAX - project.slots;
  if (room < 1) return fail(`This project already has the most slots (${SLOTS_MAX}).`);
  const parsed = z
    .object({
      extra: z.coerce
        .number()
        .int()
        .min(1, "Ask for at least 1 slot.")
        .max(room, `You can ask for at most ${room} more.`),
      reason: z
        .string()
        .trim()
        .min(10, "Say briefly why (at least 10 characters).")
        .max(500, "Keep it under 500 characters."),
    })
    .safeParse({ extra: formData.get("extra"), reason: formData.get("reason") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request.");

  const pending = await db.projectSlotRequest.findFirst({
    where: { projectId, status: "pending" },
    select: { id: true },
  });
  if (pending) return fail("There is already a request waiting for an admin.");

  await db.projectSlotRequest.create({
    data: { projectId, requestedById: access.user.id, ...parsed.data },
  });
  refresh();
  return { ok: true, message: "Request sent. An admin will review it." };
}

/** The leader withdraws a pending request. */
export async function cancelSlotRequest(formData: FormData): Promise<void> {
  const id = formId(formData, "requestId");
  if (!id) return;
  const db = getDb();
  const request = await db.projectSlotRequest.findUnique({
    where: { id },
    select: { projectId: true, status: true },
  });
  if (!request || request.status !== "pending") return;
  const access = await getProjectAccessById(request.projectId);
  if (!access?.canRequestSlots) return;
  await db.projectSlotRequest.update({ where: { id }, data: { status: "cancelled" } });
  refresh();
}

/** Admins set a project's slots directly (never below what is in use). */
export async function setSlots(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const projectId = formId(formData, "projectId");
  const access = projectId ? await getProjectAccessById(projectId) : null;
  if (!access) return fail("Project not found.");
  if (!access.isAdmin) return fail("Only admins can change the number of slots.");
  const usage = await slotUsage(projectId);
  const min = Math.max(1, usage.used);
  const slots = z.coerce
    .number()
    .int()
    .min(min, `At least ${min}: that many slots are in use.`)
    .max(SLOTS_MAX, `At most ${SLOTS_MAX}.`)
    .safeParse(formData.get("slots"));
  if (!slots.success) return fail(slots.error.issues[0]?.message ?? "Invalid number.");
  await getDb().project.update({ where: { id: projectId }, data: { slots: slots.data } });
  refresh();
  return { ok: true, message: `Slots set to ${slots.data}.` };
}
