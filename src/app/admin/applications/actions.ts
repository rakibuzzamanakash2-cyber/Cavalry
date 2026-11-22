"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export type ReviewState = { ok: boolean; message: string } | null;

const reviewSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["accept", "reject"]),
  note: z.string().trim().max(1000).optional().default(""),
});

/**
 * Accept or reject a pending application. Admins only, re-checked here.
 * Accepting makes the applicant a member in the same transaction.
 */
export async function reviewApplication(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const admin = await requireAdmin("/admin/applications");
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Invalid request." };
  const { id, decision, note } = parsed.data;

  const db = getDb();
  const result = await db.$transaction(async (tx) => {
    const app = await tx.application.findUnique({
      where: { id },
      include: { user: { select: { id: true, role: true } } },
    });
    if (!app) return { ok: false, message: "Application not found." };
    if (app.status !== "pending")
      return { ok: false, message: "This application was already handled." };

    await tx.application.update({
      where: { id },
      data: {
        status: decision === "accept" ? "accepted" : "rejected",
        reviewerId: admin.id,
        reviewNote: note || null,
        reviewedAt: new Date(),
      },
    });
    // Only upgrade plain users; never downgrade an admin.
    if (decision === "accept" && app.user.role === "user") {
      await tx.user.update({ where: { id: app.user.id }, data: { role: "member" } });
    }
    return {
      ok: true,
      message: decision === "accept" ? "Accepted. They are now a member." : "Application rejected.",
    };
  });

  refresh();
  return result;
}
