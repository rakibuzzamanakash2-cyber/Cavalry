import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { ProgrammeArticle } from "@/components/programme-article";
import { getPublicProgramme } from "@/data/programmes";

export async function generateMetadata({
  params,
}: PageProps<"/research/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const programme = await getPublicProgramme(slug);
  if (!programme) return {};
  return {
    title: programme.title,
    description: programme.summary,
    openGraph: { type: "article", title: programme.title, description: programme.summary },
  };
}

// Public: only completed programmes. Work in progress lives in /workspace.
export default function PublicProgrammePage({ params }: PageProps<"/research/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <PublicProgramme params={params} />
    </Suspense>
  );
}

async function PublicProgramme({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const programme = await getPublicProgramme(slug);
  if (!programme) notFound();
  return (
    <ProgrammeArticle
      programme={programme}
      backHref="/research"
      backLabel="All research"
      audience="public"
    />
  );
}
