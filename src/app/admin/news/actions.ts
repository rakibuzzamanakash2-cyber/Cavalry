"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { newsSchema } from "@/lib/admin-content";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { slugify, uniqueSlug } from "@/lib/slug";
import { fieldErrors, formValues, type ContentState } from "../content-state";

const KEYS = ["title", "excerpt", "body", "tags", "visibility", "publish"] as const;

function parse(formData: FormData) {
  const values = formValues(formData, KEYS);
  const parsed = newsSchema.safeParse(values);
  return { values, parsed };
}

export async function createPost(_prev: ContentState, formData: FormData): Promise<ContentState> {
  await requireAdmin("/admin/news/new");
  const { values, parsed } = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: fieldErrors(parsed.error.issues),
      values,
    };
  }
  const { publish, ...data } = parsed.data;
  const db = getDb();
  const slug = await uniqueSlug(slugify(data.title, "post"), async (s) =>
    Boolean(await db.newsPost.findUnique({ where: { slug: s }, select: { id: true } })),
  );
  await db.newsPost.create({
    data: { ...data, slug, publishedAt: publish === "published" ? new Date() : null },
  });
  updateTag("news");
  redirect("/admin/news");
}

export async function updatePost(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const id = String(formData.get("id") ?? "");
  await requireAdmin(`/admin/news/${id}`);
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Post not found." };
  const db = getDb();
  const existing = await db.newsPost.findUnique({
    where: { id },
    select: { publishedAt: true, slug: true },
  });
  if (!existing) return { ok: false, message: "Post not found." };

  const { values, parsed } = parse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: fieldErrors(parsed.error.issues),
      values,
    };
  }
  const { publish, ...data } = parsed.data;
  await db.newsPost.update({
    where: { id },
    data: {
      ...data,
      // Keep the original date when a published post is edited.
      publishedAt: publish === "published" ? (existing.publishedAt ?? new Date()) : null,
    },
  });
  updateTag("news");
  updateTag(`news:${existing.slug}`);
  redirect("/admin/news");
}

export async function deletePost(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  await requireAdmin("/admin/news");
  if (!z.uuid().safeParse(id).success) return;
  const post = await getDb().newsPost.findUnique({ where: { id }, select: { slug: true } });
  if (!post) return;
  await getDb().newsPost.delete({ where: { id } });
  updateTag("news");
  updateTag(`news:${post.slug}`);
  redirect("/admin/news");
}
