import "server-only";
import type { ApplicationStatus } from "@/lib/applications";
import { getDb } from "@/lib/db";
import { requireAdmin, requireUser, type CurrentUser } from "@/lib/session";

// Applications are personal data: never cached across users. Every getter
// checks who is asking before reading.

export type MyApplication = {
  id: string;
  field: string;
  status: ApplicationStatus;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

/** The signed-in user's own applications, newest first. */
export async function getMyApplications(): Promise<MyApplication[]> {
  const user = await requireUser("/apply");
  const rows = await getDb().application.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      field: true,
      status: true,
      reviewNote: true,
      createdAt: true,
      reviewedAt: true,
    },
  });
  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
  }));
}

export type ApplicationForReview = {
  id: string;
  field: string;
  motivation: string;
  background: string;
  sampleUrl: string | null;
  hoursPerWeek: number;
  status: ApplicationStatus;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  applicant: { id: string; name: string; email: string; role: string };
  reviewer: { name: string } | null;
};

/** All applications, pending first. Admins only. */
export async function getApplicationsForReview(): Promise<ApplicationForReview[]> {
  await requireAdmin("/admin/applications");
  const rows = await getDb().application.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      reviewer: { select: { name: true } },
    },
  });
  const order: Record<ApplicationStatus, number> = {
    pending: 0,
    accepted: 1,
    rejected: 2,
    withdrawn: 3,
  };
  return rows
    .map((r) => ({
      id: r.id,
      field: r.field,
      motivation: r.motivation,
      background: r.background,
      sampleUrl: r.sampleUrl,
      hoursPerWeek: r.hoursPerWeek,
      status: r.status,
      reviewNote: r.reviewNote,
      createdAt: r.createdAt.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString() ?? null,
      applicant: r.user,
      reviewer: r.reviewer,
    }))
    .sort((a, b) => order[a.status] - order[b.status]);
}

/** Number of applications waiting for review; 0 for anyone who isn't an admin. */
export async function countPendingApplications(user: CurrentUser | null): Promise<number> {
  if (user?.role !== "admin") return 0;
  return getDb().application.count({ where: { status: "pending" } });
}
