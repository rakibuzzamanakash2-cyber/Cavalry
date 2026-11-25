import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { getDatasetForEdit } from "@/data/datasets";
import { deleteDataset, updateDataset } from "../../actions";
import { DatasetForm } from "../../dataset-form";

export const metadata: Metadata = {
  title: "Edit dataset",
  robots: { index: false, follow: false },
};

export default function EditDatasetPage({ params }: PageProps<"/workspace/datasets/[id]/edit">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <Suspense fallback={<ArticleSkeleton />}>
        <EditDataset params={params} />
      </Suspense>
    </div>
  );
}

async function EditDataset({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const found = await getDatasetForEdit(id);
  if (!found) notFound();
  const { dataset, projectId, projects } = found;

  return (
    <>
      <PageHeader eyebrow="Workspace · datasets" title={`Edit ${dataset.name}`}>
        Only the person who added it, the project leader and admins can change or delete it.
      </PageHeader>
      <div className="pt-8">
        <DatasetForm
          action={updateDataset}
          id={dataset.id}
          projects={projects}
          initial={{
            name: dataset.name,
            description: dataset.description,
            usedFor: dataset.usedFor,
            url: dataset.url,
            projectId,
          }}
          submitLabel="Save changes"
        />
      </div>
      <form action={deleteDataset} className="border-line mt-12 border-t pt-8">
        <input type="hidden" name="id" value={dataset.id} />
        <p className="text-muted mb-4 text-sm">
          Deleting removes the entry here. The data itself stays on GitHub or Drive.
        </p>
        <button type="submit" className={ui.ghostSm}>
          Delete dataset
        </button>
      </form>
    </>
  );
}
