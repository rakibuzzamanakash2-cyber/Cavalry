import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { ProgrammeArticle } from "@/components/programme-article";
import { RestrictedProject } from "@/components/restricted-project";
import { ui } from "@/components/ui";
import { DatasetList } from "@/components/dataset-list";
import { getProjectDatasets } from "@/data/datasets";
import { getProjectDetail } from "@/data/projects";

export const metadata: Metadata = { title: "Project", robots: { index: false, follow: false } };

// Details only for the project's team and admins; getProjectDetail decides.
export default function ProjectPage({ params }: PageProps<"/workspace/projects/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ProjectView params={params} />
    </Suspense>
  );
}

async function ProjectView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await getProjectDetail(slug);
  if (detail.kind === "missing") notFound();
  if (detail.kind === "restricted") return <RestrictedProject {...detail} />;

  const { programme, team, access } = detail;
  const datasets = await getProjectDatasets(access);
  return (
    <ProgrammeArticle
      programme={programme}
      backHref="/workspace"
      backLabel="Workspace"
      audience="workspace"
    >
      <section aria-labelledby="project-team" className="border-line border-b py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="project-team" className="text-xl">
            Team · {team.length} {team.length === 1 ? "person" : "people"}
          </h2>
          <Link href={`/workspace/projects/${programme.slug}/team`} className={ui.link}>
            {access.canManage ? "Manage team and invites →" : "See the team →"}
          </Link>
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {team.map((m) => (
            <li key={m.membershipId}>
              <span className="font-medium">{m.name}</span>{" "}
              <span className="text-muted">· {m.role}</span>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="project-datasets" className="border-line border-b py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="project-datasets" className="text-xl">
            Datasets · {datasets.length}
          </h2>
          <Link href={`/workspace/datasets/new?project=${programme.slug}`} className={ui.link}>
            Add a dataset →
          </Link>
        </div>
        {datasets.length > 0 ? (
          <div className="mt-4">
            <DatasetList datasets={datasets} />
          </div>
        ) : (
          <p className="text-muted mt-2 text-sm">
            No datasets linked yet. Add the data this project uses, with its GitHub or Drive link.
          </p>
        )}
      </section>
    </ProgrammeArticle>
  );
}
