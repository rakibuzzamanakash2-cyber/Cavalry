import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { getProjectForEdit } from "@/data/projects";
import { ProjectEditor } from "./project-editor";
import { StatusForm } from "./status-form";

export const metadata: Metadata = {
  title: "Edit project",
  robots: { index: false, follow: false },
};

// Leader, co-leaders and admins; the save action checks again.
export default function EditProjectPage({ params }: PageProps<"/workspace/projects/[slug]/edit">) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
      <Suspense fallback={<ArticleSkeleton />}>
        <Editor params={params} />
      </Suspense>
    </div>
  );
}

async function Editor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getProjectForEdit(slug);
  if (found.kind === "missing") notFound();
  if (found.kind === "forbidden") {
    return (
      <div className="py-16">
        <h1 className="text-4xl leading-tight">{found.title}</h1>
        <p className="text-muted mt-4 text-lg">
          Only the leader, co-leaders and admins can edit this project.
        </p>
        <p className="mt-8">
          <Link href={`/workspace/projects/${slug}`} className={ui.link}>
            ← Back to the project
          </Link>
        </p>
      </div>
    );
  }

  const { access, programme: p, status } = found;
  return (
    <>
      <PageHeader eyebrow={`Programme ${p.number} · edit`} title={p.title}>
        Edit the research plan. Empty sections are hidden on the project page. Saving updates the
        &ldquo;last updated&rdquo; date.
      </PageHeader>

      {access.isAdmin ? (
        <section aria-labelledby="publishing" className="border-line border-b py-8">
          <h2 id="publishing" className="text-xl">
            Publishing
          </h2>
          <p className="text-muted mt-2 max-w-3xl text-sm leading-relaxed">
            Research in progress is visible to the project&apos;s team only. Marking a project
            completed publishes the whole plan on the public site as finished work. Only admins can
            change this.
          </p>
          <div className="mt-4">
            <StatusForm projectId={access.projectId} status={status} />
          </div>
        </section>
      ) : status === "completed" ? (
        <p className="border-accent mt-8 border-l-2 pl-3 text-sm">
          This project is published on the public site. Your changes will appear there too.
        </p>
      ) : null}

      <div className="py-8">
        <ProjectEditor
          projectId={access.projectId}
          slug={p.slug}
          initial={{
            title: p.title,
            summary: p.summary,
            question: p.question,
            statusLabel: p.status,
            areas: p.areas,
            leads: p.leads,
            currentStage: p.currentStage,
            whyItMatters: p.whyItMatters,
            subQuestions: p.subQuestions,
            design: p.design,
            dataSources: p.dataSources,
            approach: p.approach,
            scopes: p.scopes,
            stages: p.stages,
            outputs: p.outputs,
            commitments: p.commitments,
            highlights: p.highlights,
          }}
        />
      </div>
    </>
  );
}
