import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { linkKind } from "@/lib/datasets";
import type { ProjectAccess } from "@/lib/project-access";
import { requireMember, type CurrentUser } from "@/lib/session";

// Datasets: shared ones (no project) are visible to every member; a project's
// datasets only to its team and admins. Who may edit: the person who added
// it, the project leader, or an admin.

export type DatasetRow = {
  id: string;
  name: string;
  description: string;
  usedFor: string;
  url: string;
  kind: ReturnType<typeof linkKind>;
  project: { slug: string; title: string; number: string } | null;
  addedBy: string | null;
  updatedAt: string;
  canEdit: boolean;
};

const include = {
  project: { select: { slug: true, title: true, number: true, leaderId: true } },
  addedBy: { select: { name: true } },
} satisfies Prisma.DatasetInclude;

type Row = Prisma.DatasetGetPayload<{ include: typeof include }>;

function toRow(d: Row, user: CurrentUser): DatasetRow {
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    usedFor: d.usedFor,
    url: d.url,
    kind: linkKind(d.url),
    project: d.project
      ? { slug: d.project.slug, title: d.project.title, number: d.project.number }
      : null,
    addedBy: d.addedBy?.name ?? null,
    updatedAt: d.updatedAt.toISOString(),
    canEdit: user.role === "admin" || d.addedById === user.id || d.project?.leaderId === user.id,
  };
}

/** Projects the user can see in full (team member, leader, or any if admin). */
export async function getMyProjects(user: CurrentUser) {
  return getDb().project.findMany({
    where:
      user.role === "admin"
        ? {}
        : { OR: [{ leaderId: user.id }, { memberships: { some: { userId: user.id } } }] },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, slug: true, title: true, number: true, leaderId: true },
  });
}

function visibleWhere(user: CurrentUser, projectIds: string[]): Prisma.DatasetWhereInput {
  return user.role === "admin"
    ? {}
    : { OR: [{ projectId: null }, { projectId: { in: projectIds } }] };
}

/** Every dataset the signed-in member may see, plus the projects they can file under. */
export async function getDatasets() {
  const user = await requireMember("/workspace/datasets");
  const projects = await getMyProjects(user);
  const rows = await getDb().dataset.findMany({
    where: visibleWhere(
      user,
      projects.map((p) => p.id),
    ),
    include,
    orderBy: [{ name: "asc" }],
  });
  return { datasets: rows.map((d) => toRow(d, user)), projects };
}

/** One dataset to edit, or null if it is not visible or not editable by this user. */
export async function getDatasetForEdit(id: string) {
  const user = await requireMember(`/workspace/datasets/${id}/edit`);
  const projects = await getMyProjects(user);
  const row = await getDb().dataset.findFirst({
    where: {
      AND: [
        { id },
        visibleWhere(
          user,
          projects.map((p) => p.id),
        ),
      ],
    },
    include,
  });
  if (!row) return null;
  const dataset = toRow(row, user);
  if (!dataset.canEdit) return null;
  return { dataset, projectId: row.projectId ?? "", projects };
}

/** A project's datasets, for a page that has already checked project access. */
export async function getProjectDatasets(access: ProjectAccess) {
  if (!access.canView) return [];
  const rows = await getDb().dataset.findMany({
    where: { projectId: access.projectId },
    include,
    orderBy: { name: "asc" },
  });
  return rows.map((d) => toRow(d, access.user));
}
