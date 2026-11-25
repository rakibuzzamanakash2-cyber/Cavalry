"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { datasetSchema, type DatasetInput } from "@/lib/datasets";
import { getProjectAccessById } from "@/lib/project-access";
import { requireMember, type CurrentUser } from "@/lib/session";

// Every action re-checks who may file under a project and who may edit.

export type DatasetState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<keyof DatasetInput, string>>;
  values?: Partial<DatasetInput>;
} | null;

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    usedFor: String(formData.get("usedFor") ?? ""),
    url: String(formData.get("url") ?? ""),
    projectId: String(formData.get("projectId") ?? ""),
  };
}

function invalid(values: DatasetInput, issues: z.core.$ZodIssue[]): DatasetState {
  const errors: Record<string, string> = {};
  for (const i of issues) errors[String(i.path[0])] ??= i.message;
  return { ok: false, message: "Please fix the highlighted fields.", errors, values };
}

/** Members can file a dataset as shared, or under a project they are on. */
async function canFileUnder(projectId: string) {
  if (!projectId) return true;
  const access = await getProjectAccessById(projectId);
  return Boolean(access?.canView);
}

async function editable(id: string, user: CurrentUser) {
  if (!z.uuid().safeParse(id).success) return null;
  const d = await getDb().dataset.findUnique({
    where: { id },
    select: { id: true, addedById: true, projectId: true, project: { select: { leaderId: true } } },
  });
  if (!d) return null;
  if (d.projectId && !(await canFileUnder(d.projectId))) return null;
  const ok = user.role === "admin" || d.addedById === user.id || d.project?.leaderId === user.id;
  return ok ? d : null;
}

export async function createDataset(
  _prev: DatasetState,
  formData: FormData,
): Promise<DatasetState> {
  const user = await requireMember("/workspace/datasets/new");
  const values = readForm(formData);
  const parsed = datasetSchema.safeParse(values);
  if (!parsed.success) return invalid(values, parsed.error.issues);
  const { projectId, ...data } = parsed.data;
  if (!(await canFileUnder(projectId))) {
    return invalid(values, [
      { code: "custom", path: ["projectId"], message: "You are not on that project.", input: "" },
    ]);
  }

  const created = await getDb().dataset.create({
    data: { ...data, projectId: projectId || null, addedById: user.id },
    select: { id: true },
  });
  redirect(`/workspace/datasets#dataset-${created.id}`);
}

export async function updateDataset(
  _prev: DatasetState,
  formData: FormData,
): Promise<DatasetState> {
  const id = String(formData.get("id") ?? "");
  const user = await requireMember(`/workspace/datasets/${id}/edit`);
  const values = readForm(formData);
  const existing = await editable(id, user);
  if (!existing) return { ok: false, message: "You can't edit this dataset.", values };

  const parsed = datasetSchema.safeParse(values);
  if (!parsed.success) return invalid(values, parsed.error.issues);
  const { projectId, ...data } = parsed.data;
  if (projectId !== (existing.projectId ?? "") && !(await canFileUnder(projectId))) {
    return invalid(values, [
      { code: "custom", path: ["projectId"], message: "You are not on that project.", input: "" },
    ]);
  }

  await getDb().dataset.update({ where: { id }, data: { ...data, projectId: projectId || null } });
  redirect(`/workspace/datasets#dataset-${id}`);
}

export async function deleteDataset(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const user = await requireMember("/workspace/datasets");
  if (!(await editable(id, user))) return;
  await getDb().dataset.delete({ where: { id } });
  refresh();
  redirect("/workspace/datasets");
}
