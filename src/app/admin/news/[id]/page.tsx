import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deletePost, updatePost } from "../actions";
import { NewsForm } from "../news-form";

export const metadata: Metadata = { title: "Edit post", robots: { index: false, follow: false } };
export const instant = false;

export default function EditPostPage({ params }: PageProps<"/admin/news/[id]">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <Suspense fallback={<ArticleSkeleton />}>
        <Editor params={params} />
      </Suspense>
    </div>
  );
}

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/admin/news/${id}`);
  if (!z.uuid().safeParse(id).success) notFound();
  const post = await getDb().newsPost.findUnique({ where: { id } });
  if (!post) notFound();
  return (
    <>
      <PageHeader eyebrow="Admin · news" title={`Edit: ${post.title}`} />
      <div className="pt-8">
        <NewsForm
          action={updatePost}
          id={post.id}
          submitLabel="Save changes"
          initial={{
            title: post.title,
            excerpt: post.excerpt,
            body: post.body,
            tags: post.tags.join(", "),
            visibility: post.visibility,
            publish: post.publishedAt ? "published" : "draft",
          }}
        />
      </div>
      <form action={deletePost} className="border-line mt-12 border-t pt-8">
        <input type="hidden" name="id" value={post.id} />
        <button type="submit" className={ui.ghostSm}>
          Delete post
        </button>
      </form>
    </>
  );
}
