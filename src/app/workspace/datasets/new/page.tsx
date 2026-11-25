import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { getMyProjects } from "@/data/datasets";
import { requireMember } from "@/lib/session";
import { createDataset } from "../actions";
import { DatasetForm } from "../dataset-form";

export const metadata: Metadata = {
  title: "Add a dataset",
  robots: { index: false, follow: false },
};

export default function NewDatasetPage({ searchParams }: PageProps<"/workspace/datasets/new">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Workspace · datasets" title="Add a dataset">
        Link the data where it lives (a GitHub repository or a Google Drive folder) and say what it
        is for. Choose a project to keep it to that team.
      </PageHeader>
      <div className="pt-8">
        <Suspense fallback={<ArticleSkeleton />}>
          <NewDataset searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function NewDataset({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireMember("/workspace/datasets/new");
  const [projects, sp] = await Promise.all([getMyProjects(user), searchParams]);
  const preselect = projects.find((p) => p.slug === sp.project)?.id ?? "";
  return (
    <DatasetForm
      action={createDataset}
      projects={projects}
      initial={{ projectId: preselect }}
      submitLabel="Add dataset"
    />
  );
}
