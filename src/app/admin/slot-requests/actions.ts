"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { SLOTS_MAX } from "@/lib/project-rules";
import { requireAdmin } from "@/lib/session";

export type DecideState = { ok: boolean; message: string } | null;

const decideSchema = z.object({
  requestId: z.uuid(),
  decision: z.enum(["approved", "declined"]),
  adminNote: z.string().trim().max(300, "Keep the note under 300 characters.").default(""),
});

/**
 * Approve (adds the slots, never past the maximum) or decline a leader's
 * request. Admins only; a request is decided once.
 */
export async function decideSlotRequest(
  _prev: DecideState,
  formData: FormData,
): Promise<DecideState> {
  const admin = await requireAdmin("/admin/slot-requests");
  const parsed = decideSchema.safeParse({
    requestId: formData.get("requestId"),
    decision: formData.get("decision"),
    adminNote: formData.get("adminNote") ?? "",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid." };
  const { requestId, decision, adminNote } = parsed.data;

  const db = getDb();
  const result = await db.$transaction(async (tx) => {
    const claimed = await tx.projectSlotRequest.updateMany({
      where: { id: requestId, status: "pending" },
      data: {
        status: decision,
        decidedById: admin.id,
        decidedAt: new Date(),
        adminNote: adminNote || null,
      },
    });
    if (claimed.count !== 1) return null;
    const request = await tx.projectSlotRequest.findUniqueOrThrow({
      where: { id: requestId },
      select: { extra: true, project: { select: { id: true, slots: true } } },
    });
    if (decision === "approved") {
      const slots = Math.min(SLOTS_MAX, request.project.slots + request.extra);
      await tx.project.update({ where: { id: request.project.id }, data: { slots } });
      return slots;
    }
    return request.project.slots;
  });

  if (result === null)
    return { ok: false, message: "This request was already decided or withdrawn." };
  refresh();
  return {
    ok: true,
    message:
      decision === "approved" ? `Approved. The project now has ${result} slots.` : "Declined.",
  };
}
