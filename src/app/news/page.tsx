import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getPublicPosts } from "@/data/news";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "News",
  description: "Updates from CAVALRY research: programme milestones, changes to plans and outputs.",
};

export default async function NewsPage() {
  const posts = await getPublicPosts();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="News" title="Updates and milestones">
        Announcements, finished work and anything we publish.
      </PageHeader>

      {posts.length === 0 ? (
        <div className="border-line bg-sand/40 mt-10 border p-5 sm:mt-14 sm:p-6">
          <p className="font-serif text-xl">No public updates yet.</p>
          <p className="text-muted mt-2 max-w-2xl leading-relaxed">
            Milestones and finished work will be announced here.
          </p>
        </div>
      ) : null}

      <ul className="border-line divide-line mt-10 divide-y border-y sm:mt-14">
        {posts.map((post) => (
          <li key={post.slug}>
            <article className="grid gap-3 py-6 md:grid-cols-12 md:gap-6">
              <p className="text-muted tracking-caps text-xs uppercase md:col-span-3 md:pt-2">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
              <div className="md:col-span-9">
                <h2 className="text-2xl leading-snug sm:text-3xl">
                  <Link href={`/news/${post.slug}`} className="hover:text-accent transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-muted mt-2 leading-relaxed">{post.excerpt}</p>
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
                  {post.tags.map((t) => (
                    <li key={t} className="border-line text-muted border px-2 py-0.5 text-xs">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
