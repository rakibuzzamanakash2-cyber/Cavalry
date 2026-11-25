import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/session";
import { createPost } from "../actions";
import { NewsForm } from "../news-form";

export const metadata: Metadata = {
  title: "Write a post",
  robots: { index: false, follow: false },
};
export const instant = false;

export default function NewPostPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin · news" title="Write a post" />
      <div className="pt-8">
        <Suspense fallback={<ArticleSkeleton />}>
          <Form />
        </Suspense>
      </div>
    </div>
  );
}

async function Form() {
  await requireAdmin("/admin/news/new");
  return (
    <NewsForm
      action={createPost}
      submitLabel="Save post"
      initial={{
        title: "",
        excerpt: "",
        body: "",
        tags: "",
        visibility: "members",
        publish: "draft",
      }}
    />
  );
}
