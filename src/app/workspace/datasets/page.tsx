import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { DatasetList } from "@/components/dataset-list";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { ui } from "@/components/ui";
import { getDatasets } from "@/data/datasets";

export const metadata: Metadata = { title: "Datasets", robots: { index: false, follow: false } };

export default function DatasetsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Workspace · datasets" title="Datasets">
        The data our research uses, what each dataset is for, and where to get it. Shared datasets
        are visible to every member; a project&apos;s datasets only to its team.
      </PageHeader>
      <Suspense fallback={<ArticleSkeleton />}>
        <Datasets />
      </Suspense>
    </div>
  );
}

async function Datasets() {
  const { datasets, projects } = await getDatasets();
  const shared = datasets.filter((d) => !d.project);
  const byProject = projects
    .map((p) => ({ ...p, items: datasets.filter((d) => d.project?.slug === p.slug) }))
    .filter((p) => p.items.length > 0);

  return (
    <>
      <p className="flex flex-wrap items-center gap-6 pt-8">
        <Link href="/workspace/datasets/new" className={ui.button}>
          Add a dataset
        </Link>
        <span className="text-muted text-sm">
          {datasets.length} {datasets.length === 1 ? "dataset" : "datasets"} you can see
        </span>
      </p>

      <section aria-labelledby="shared" className="py-10">
        <SectionHeading number="01" id="shared">
          Shared with every member
        </SectionHeading>
        <div className="mt-6">
          {shared.length > 0 ? (
            <DatasetList datasets={shared} />
          ) : (
            <p className="text-muted">No shared datasets yet.</p>
          )}
        </div>
      </section>

      {byProject.map((p, i) => (
        <section
          key={p.id}
          aria-labelledby={`project-${p.slug}`}
          className="border-line border-t py-10"
        >
          <SectionHeading number={String(i + 2).padStart(2, "0")} id={`project-${p.slug}`}>
            Programme {p.number}: {p.title}
          </SectionHeading>
          <p className="text-muted mt-2 text-sm">Visible only to this project&apos;s team.</p>
          <div className="mt-6">
            <DatasetList datasets={p.items} />
          </div>
        </section>
      ))}
    </>
  );
}
