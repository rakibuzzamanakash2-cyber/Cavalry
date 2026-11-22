import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { NewsPost } from "@/content/news";
import type { NewsPost as NewsRow } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { requireMember } from "@/lib/session";

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

// Published = publishedAt set and in the past. Visibility "public" posts are
// for everyone; "members" posts are for the workspace only.

async function listPosts(scope: "public" | "all"): Promise<NewsPost[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("news");
  const rows = await getDb().newsPost.findMany({
    where: {
      publishedAt: { not: null, lte: new Date() },
      ...(scope === "public" ? { visibility: "public" as const } : {}),
    },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(toPost);
}

async function findPost(slug: string, scope: "public" | "all"): Promise<NewsPost | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("news", `news:${slug}`);
  const row = await getDb().newsPost.findFirst({
    where: {
      slug,
      publishedAt: { not: null, lte: new Date() },
      ...(scope === "public" ? { visibility: "public" as const } : {}),
    },
  });
  return row ? toPost(row) : null;
}

/** Public news, for everyone. */
export function getPublicPosts() {
  return listPosts("public");
}

export function getPublicPost(slug: string) {
  return findPost(slug, "public");
}

/** All published news, including members-only updates. Members only. */
export async function getWorkspacePosts(): Promise<NewsPost[]> {
  await requireMember("/workspace");
  return listPosts("all");
}
