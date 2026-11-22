import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { posts as contentPosts, type NewsPost } from "@/content/news";
import type { NewsPost as NewsRow } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";

function toPost(r: NewsRow): NewsPost {
  return {
    slug: r.slug,
    title: r.title,
    // Published rows only reach here, so publishedAt is set.
    date: (r.publishedAt ?? r.createdAt).toISOString().slice(0, 10),
    excerpt: r.excerpt,
    body: r.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    tags: r.tags,
  };
}

/**
 * Published posts, newest first. Posts with a future publish date are not
 * shown; the page cache refreshes hourly, so they appear within the hour.
 */
export async function getPosts(): Promise<NewsPost[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("news");
  if (!isDatabaseConfigured()) return contentPosts;
  const rows = await getDb().newsPost.findMany({
    where: { publishedAt: { not: null, lte: new Date() } },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(toPost);
}

export async function getPost(slug: string): Promise<NewsPost | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("news", `news:${slug}`);
  if (!isDatabaseConfigured()) return contentPosts.find((p) => p.slug === slug) ?? null;
  const row = await getDb().newsPost.findFirst({
    where: { slug, publishedAt: { not: null, lte: new Date() } },
  });
  return row ? toPost(row) : null;
}
