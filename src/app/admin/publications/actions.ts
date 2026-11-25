"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { OutputStatus, OutputType } from "@/generated/prisma/enums";
import { publicationSchema } from "@/lib/admin-content";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { slugify, uniqueSlug } from "@/lib/slug";
import { fieldErrors, formValues, type ContentState } from "../content-state";

const KEYS = [
  "title",
  "type",
  "status",
  "authors",
  "year",
  "venue",
  "abstract",
  "url",
  "pdfUrl",
  "doi",
  "projectId",
] as const;

type PublicationData = {
  title: string;
  type: OutputType;
  status: OutputStatus;
  authors: string;
  year: number | null;
  venue: string | null;
  abstract: string;
  url: string | null;
  pdfUrl: string | null;
  doi: string | null;
  projectId: string | null;
};

type Parsed = { error: NonNullable<ContentState> } | { data: PublicationData };

async function parse(formData: FormData): Promise<Parsed> {
  const values = formValues(formData, KEYS);
  const parsed = publicationSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: {
        ok: false,
        message: "Please fix the highlighted fields.",
        errors: fieldErrors(parsed.error.issues),
        values,
      },
    };
  }
  const d = parsed.data;
  if (d.projectId) {
    const exists = await getDb().project.findUnique({
      where: { id: d.projectId },
      select: { id: true },
    });
    if (!exists) {
      return {
        error: {
          ok: false,
          message: "That programme no longer exists.",
          values,
        } satisfies ContentState,
      };
    }
  }
  return {
    data: {
      title: d.title,
      type: d.type,
      status: d.status,
      authors: d.authors,
      year: d.year,
      venue: d.venue || null,
      abstract: d.abstract,
      url: d.url || null,
      pdfUrl: d.pdfUrl || null,
      doi: d.doi || null,
      projectId: d.projectId || null,
    },
  };
}

export async function createPublication(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  await requireAdmin("/admin/publications/new");
  const result = await parse(formData);
  if ("error" in result) return result.error;
  const db = getDb();
  const slug = await uniqueSlug(slugify(result.data.title, "output"), async (s) =>
    Boolean(await db.publication.findUnique({ where: { slug: s }, select: { id: true } })),
  );
  await db.publication.create({ data: { ...result.data, slug } });
  updateTag("publications");
  redirect("/admin/publications");
}

export async function updatePublication(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const id = String(formData.get("id") ?? "");
  await requireAdmin(`/admin/publications/${id}`);
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Publication not found." };
  const result = await parse(formData);
  if ("error" in result) return result.error;
  await getDb().publication.update({ where: { id }, data: result.data });
  updateTag("publications");
  redirect("/admin/publications");
}

export async function deletePublication(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  await requireAdmin("/admin/publications");
  if (!z.uuid().safeParse(id).success) return;
  await getDb().publication.deleteMany({ where: { id } });
  updateTag("publications");
  redirect("/admin/publications");
}
