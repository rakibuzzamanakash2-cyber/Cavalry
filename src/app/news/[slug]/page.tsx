import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { getPost, getPosts } from "@/data/news";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", title: post.title, description: post.excerpt },
  };
}

// Slug-dependent work inside <Suspense>: see the note in research/[slug]/page.tsx.
export default function NewsPostPage({ params }: PageProps<"/news/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton narrow />}>
      <NewsPostContent params={params} />
    </Suspense>
  );
}

async function NewsPostContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    datePublished: post.date,
    description: post.excerpt,
    publisher: { "@type": "ResearchOrganization", name: site.name, url: site.url },
  };

  return (
    <article className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="tracking-caps pt-6 text-xs uppercase sm:pt-8">
        <ol className="text-muted flex flex-wrap items-center gap-2">
          <li>
            <Link href="/news" className="hover:text-accent transition-colors">
              News
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </li>
        </ol>
      </nav>

      <header className="border-line border-b pt-6 pb-8">
        <h1 className="text-4xl leading-[1.1] sm:text-5xl">{post.title}</h1>
        <p className="text-muted mt-4 font-serif text-lg leading-snug italic sm:text-xl">
          {post.excerpt}
        </p>
      </header>

      <div className="mt-8 space-y-5 text-lg leading-relaxed">
        {post.body.map((para) => (
          <p key={para.slice(0, 32)}>{para}</p>
        ))}
      </div>

      <footer className="border-line mt-12 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-2" aria-label="Tags">
          {post.tags.map((t) => (
            <li key={t} className="border-line text-muted border px-2 py-0.5 text-xs">
              {t}
            </li>
          ))}
        </ul>
        <Link
          href="/news"
          className="text-primary hover:text-accent tracking-caps text-xs uppercase transition-colors"
        >
          ← All news
        </Link>
      </footer>
    </article>
  );
}
