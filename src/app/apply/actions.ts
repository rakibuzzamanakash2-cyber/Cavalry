"use server";

import { refresh } from "next/cache";
import { applicationSchema } from "@/lib/applications";
import { getDb } from "@/lib/db";
import { isMemberRole } from "@/lib/roles";
import { requireUser } from "@/lib/session";

export type ApplyState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<string, string>>;
} | null;

/** Submit an application. Signed-in non-members only; one pending at a time. */
export async function submitApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const user = await requireUser("/apply");
  if (isMemberRole(user.role)) {
    return { ok: false, message: "You're already a member, so there's no need to apply." };
  }

  const parsed = applicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      errors[key] ??= issue.message;
    }
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }

  const db = getDb();
  const pending = await db.application.findFirst({
    where: { userId: user.id, status: "pending" },
    select: { id: true },
  });
  if (pending) {
    return { ok: false, message: "You already have an application under review." };
  }

  await db.application.create({ data: { userId: user.id, ...parsed.data } });
  refresh();
  return { ok: true, message: "Application sent. We'll review it soon." };
}

/** Withdraw one of your own pending applications. */
export async function withdrawApplication(formData: FormData): Promise<void> {
  const user = await requireUser("/apply");
  const id = String(formData.get("id") ?? "");
  // updateMany scoped to the owner and status, so nobody can withdraw someone else's.
  await getDb().application.updateMany({
    where: { id, userId: user.id, status: "pending" },
    data: { status: "withdrawn" },
  });
  refresh();
}
