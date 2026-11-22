import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { ProgrammeArticle } from "@/components/programme-article";
import { getWorkspaceProgramme } from "@/data/programmes";

export const metadata: Metadata = {
  title: "Programme",
  robots: { index: false, follow: false },
};

// Members only: getWorkspaceProgramme checks membership before reading anything.
export default function WorkspaceProgrammePage({
  params,
}: PageProps<"/workspace/research/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <WorkspaceProgramme params={params} />
    </Suspense>
  );
}

async function WorkspaceProgramme({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const programme = await getWorkspaceProgramme(slug);
  if (!programme) notFound();
  return (
    <ProgrammeArticle
      programme={programme}
      backHref="/workspace"
      backLabel="Workspace"
      audience="workspace"
    />
  );
}
