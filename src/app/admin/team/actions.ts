"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { openRoleSchema, personSchema } from "@/lib/admin-content";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { slugify, uniqueSlug } from "@/lib/slug";
import { fieldErrors, formValues, type ContentState } from "../content-state";

const PERSON_KEYS = [
  "name",
  "role",
  "focus",
  "bio",
  "photoUrl",
  "linkedinUrl",
  "githubUrl",
  "scholarUrl",
  "isFounder",
  "isActive",
  "sortOrder",
] as const;
const ROLE_KEYS = ["title", "background", "owns", "isOpen", "sortOrder"] as const;

const invalid = (issues: z.core.$ZodIssue[], values: Record<string, string>): ContentState => ({
  ok: false,
  message: "Please fix the highlighted fields.",
  errors: fieldErrors(issues),
  values,
});

function personData(d: z.infer<typeof personSchema>) {
  return {
    ...d,
    photoUrl: d.photoUrl || null,
    linkedinUrl: d.linkedinUrl || null,
    githubUrl: d.githubUrl || null,
    scholarUrl: d.scholarUrl || null,
  };
}

export async function createPerson(_prev: ContentState, formData: FormData): Promise<ContentState> {
  await requireAdmin("/admin/team/people/new");
  const values = formValues(formData, PERSON_KEYS);
  const parsed = personSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error.issues, values);
  const db = getDb();
  const slug = await uniqueSlug(slugify(parsed.data.name, "person"), async (s) =>
    Boolean(await db.teamMember.findUnique({ where: { slug: s }, select: { id: true } })),
  );
  await db.teamMember.create({ data: { ...personData(parsed.data), slug } });
  updateTag("team");
  redirect("/admin/team");
}

export async function updatePerson(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const id = String(formData.get("id") ?? "");
  await requireAdmin(`/admin/team/people/${id}`);
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Person not found." };
  const values = formValues(formData, PERSON_KEYS);
  const parsed = personSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error.issues, values);
  const { count } = await getDb().teamMember.updateMany({
    where: { id },
    data: personData(parsed.data),
  });
  if (count === 0) return { ok: false, message: "Person not found." };
  updateTag("team");
  redirect("/admin/team");
}

export async function deletePerson(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  await requireAdmin("/admin/team");
  if (!z.uuid().safeParse(id).success) return;
  await getDb().teamMember.deleteMany({ where: { id } });
  updateTag("team");
  redirect("/admin/team");
}

export async function createRole(_prev: ContentState, formData: FormData): Promise<ContentState> {
  await requireAdmin("/admin/team/roles/new");
  const values = formValues(formData, ROLE_KEYS);
  const parsed = openRoleSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error.issues, values);
  const db = getDb();
  const slug = await uniqueSlug(slugify(parsed.data.title, "role"), async (s) =>
    Boolean(await db.openRole.findUnique({ where: { slug: s }, select: { id: true } })),
  );
  await db.openRole.create({ data: { ...parsed.data, slug } });
  updateTag("team");
  redirect("/admin/team");
}

export async function updateRole(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const id = String(formData.get("id") ?? "");
  await requireAdmin(`/admin/team/roles/${id}`);
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Role not found." };
  const values = formValues(formData, ROLE_KEYS);
  const parsed = openRoleSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error.issues, values);
  const { count } = await getDb().openRole.updateMany({ where: { id }, data: parsed.data });
  if (count === 0) return { ok: false, message: "Role not found." };
  updateTag("team");
  redirect("/admin/team");
}

export async function deleteRole(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  await requireAdmin("/admin/team");
  if (!z.uuid().safeParse(id).success) return;
  await getDb().openRole.deleteMany({ where: { id } });
  updateTag("team");
  redirect("/admin/team");
}
