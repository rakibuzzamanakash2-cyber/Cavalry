import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin-nav";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "News", robots: { index: false, follow: false } };
export const instant = false;

export default function AdminNewsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin" title="News">
        Write updates for the public news page or for members only. Drafts are not shown anywhere.
      </PageHeader>
      <AdminNav current="/admin/news" />
      <Suspense fallback={<ArticleSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  );
}

async function PostList() {
  await requireAdmin("/admin/news");
  const posts = await getDb().newsPost.findMany({
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
  });
  return (
    <>
      <p className="pt-8">
        <Link href="/admin/news/new" className={ui.button}>
          Write a post
        </Link>
      </p>
      {posts.length === 0 ? (
        <p className="text-muted mt-8">No posts yet.</p>
      ) : (
        <ul className="border-line divide-line mt-8 divide-y border-y">
          {posts.map((p) => (
            <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="tracking-caps text-xs uppercase">
                  <span className={p.publishedAt ? "text-accent-strong" : "text-muted"}>
                    {p.publishedAt ? "Published" : "Draft"}
                  </span>{" "}
                  <span className="text-muted">
                    · {p.visibility === "public" ? "Everyone" : "Members only"}
                    {p.publishedAt ? (
                      <>
                        {" · "}
                        <time dateTime={p.publishedAt.toISOString()}>
                          {formatDate(p.publishedAt.toISOString())}
                        </time>
                      </>
                    ) : null}
                  </span>
                </p>
                <h2 className="mt-1 text-xl leading-snug">{p.title}</h2>
              </div>
              <span className="flex gap-x-6">
                {p.publishedAt && p.visibility === "public" ? (
                  <Link href={`/news/${p.slug}`} className={ui.link}>
                    View<span className="sr-only"> {p.title}</span>
                  </Link>
                ) : null}
                <Link href={`/admin/news/${p.id}`} className={ui.link}>
                  Edit<span className="sr-only"> {p.title}</span>
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
