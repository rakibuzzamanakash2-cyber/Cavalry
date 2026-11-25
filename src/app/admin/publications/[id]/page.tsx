import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deletePublication, updatePublication } from "../actions";
import { getProjectOptions } from "../projects";
import { PublicationForm } from "../publication-form";

export const metadata: Metadata = {
  title: "Edit publication",
  robots: { index: false, follow: false },
};
export const instant = false;

export default function EditPublicationPage({ params }: PageProps<"/admin/publications/[id]">) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <Suspense fallback={<ArticleSkeleton />}>
        <Editor params={params} />
      </Suspense>
    </div>
  );
}

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/admin/publications/${id}`);
  if (!z.uuid().safeParse(id).success) notFound();
  const [r, projects] = await Promise.all([
    getDb().publication.findUnique({ where: { id } }),
    getProjectOptions(),
  ]);
  if (!r) notFound();
  return (
    <>
      <PageHeader eyebrow="Admin · publications" title={`Edit: ${r.title}`} />
      <div className="pt-8">
        <PublicationForm
          action={updatePublication}
          id={r.id}
          projects={projects}
          submitLabel="Save changes"
          initial={{
            title: r.title,
            type: r.type,
            status: r.status,
            authors: r.authors,
            year: r.year ? String(r.year) : "",
            venue: r.venue ?? "",
            abstract: r.abstract,
            url: r.url ?? "",
            pdfUrl: r.pdfUrl ?? "",
            doi: r.doi ?? "",
            projectId: r.projectId ?? "",
          }}
        />
      </div>
      <form action={deletePublication} className="border-line mt-12 border-t pt-8">
        <input type="hidden" name="id" value={r.id} />
        <button type="submit" className={ui.ghostSm}>
          Delete publication
        </button>
      </form>
    </>
  );
}
