import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/session";
import { createPerson } from "../../actions";
import { PersonForm } from "../../team-forms";

export const metadata: Metadata = {
  title: "Add a person",
  robots: { index: false, follow: false },
};
export const instant = false;

export default function NewPersonPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin · team" title="Add a person" />
      <div className="pt-8">
        <Suspense fallback={<ArticleSkeleton />}>
          <Form />
        </Suspense>
      </div>
    </div>
  );
}

async function Form() {
  await requireAdmin("/admin/team/people/new");
  return (
    <PersonForm
      action={createPerson}
      submitLabel="Save profile"
      initial={{
        name: "",
        role: "",
        focus: "",
        bio: "",
        photoUrl: "",
        email: "",
        linkedinUrl: "",
        githubUrl: "",
        scholarUrl: "",
        isFounder: false,
        isActive: true,
        sortOrder: "0",
      }}
    />
  );
}
