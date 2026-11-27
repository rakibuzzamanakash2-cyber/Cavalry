"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { LICENCES } from "@/lib/citation";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { slugify, uniqueSlug } from "@/lib/slug";

export type PublishState = { ok: boolean; message: string } | null;

const input = z.object({
  id: z.uuid(),
  licence: z.string().refine((v) => v === "" || v in LICENCES, "Choose a licence from the list."),
  intent: z.enum(["publish", "unpublish"]),
});

/** Publish a dataset to the public catalogue, or take it down. Admins only. */
export async function setDatasetPublic(
  _prev: PublishState,
  formData: FormData,
): Promise<PublishState> {
  await requireAdmin("/admin/datasets");
  const parsed = input.safeParse({
    id: formData.get("id"),
    licence: String(formData.get("licence") ?? ""),
    intent: formData.get("intent"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { id, licence, intent } = parsed.data;

  const d = await getDb().dataset.findUnique({
    where: { id },
    select: { name: true, slug: true, publishedAt: true, project: { select: { status: true } } },
  });
  if (!d) return { ok: false, message: "That dataset no longer exists." };

  if (intent === "unpublish") {
    await getDb().dataset.update({ where: { id }, data: { isPublic: false } });
    updateTag("datasets-public");
    refresh();
    return { ok: true, message: `${d.name} is no longer public.` };
  }

  if (d.project && d.project.status !== "completed") {
    return {
      ok: false,
      message: "Its project is still in progress. Publish it once the project is completed.",
    };
  }
  if (!licence) return { ok: false, message: "Choose a licence before publishing." };

  const slug =
    d.slug ??
    (await uniqueSlug(slugify(d.name), async (s) =>
      Boolean(await getDb().dataset.findUnique({ where: { slug: s }, select: { id: true } })),
    ));
  await getDb().dataset.update({
    where: { id },
    data: { isPublic: true, licence, slug, publishedAt: d.publishedAt ?? new Date() },
  });
  updateTag("datasets-public");
  refresh();
  return { ok: true, message: `${d.name} is now public at /data/${slug}.` };
}
