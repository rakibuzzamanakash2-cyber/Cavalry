import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/session";
import { createPublication } from "../actions";
import { getProjectOptions } from "../projects";
import { PublicationForm } from "../publication-form";

export const metadata: Metadata = {
  title: "Add a publication",
  robots: { index: false, follow: false },
};
export const instant = false;

export default function NewPublicationPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin · publications" title="Add a publication" />
      <div className="pt-8">
        <Suspense fallback={<ArticleSkeleton />}>
          <Form />
        </Suspense>
      </div>
    </div>
  );
}

async function Form() {
  await requireAdmin("/admin/publications/new");
  const projects = await getProjectOptions();
  return (
    <PublicationForm
      action={createPublication}
      projects={projects}
      submitLabel="Save publication"
      initial={{
        title: "",
        type: "working_paper",
        status: "in_preparation",
        authors: "",
        year: "",
        venue: "",
        abstract: "",
        url: "",
        pdfUrl: "",
        doi: "",
        projectId: "",
      }}
    />
  );
}
