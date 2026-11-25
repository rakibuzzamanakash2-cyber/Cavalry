import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deletePerson, updatePerson } from "../../actions";
import { PersonForm } from "../../team-forms";

export const metadata: Metadata = {
  title: "Edit profile",
  robots: { index: false, follow: false },
};
export const instant = false;

export default function EditPersonPage({ params }: PageProps<"/admin/team/people/[id]">) {
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
  await requireAdmin(`/admin/team/people/${id}`);
  if (!z.uuid().safeParse(id).success) notFound();
  const p = await getDb().teamMember.findUnique({ where: { id } });
  if (!p) notFound();
  return (
    <>
      <PageHeader eyebrow="Admin · team" title={`Edit: ${p.name}`} />
      <div className="pt-8">
        <PersonForm
          action={updatePerson}
          id={p.id}
          submitLabel="Save changes"
          initial={{
            name: p.name,
            role: p.role,
            focus: p.focus,
            bio: p.bio,
            photoUrl: p.photoUrl ?? "",
            email: p.email ?? "",
            linkedinUrl: p.linkedinUrl ?? "",
            githubUrl: p.githubUrl ?? "",
            scholarUrl: p.scholarUrl ?? "",
            isFounder: p.isFounder,
            isActive: p.isActive,
            sortOrder: String(p.sortOrder),
          }}
        />
      </div>
      <form action={deletePerson} className="border-line mt-12 border-t pt-8">
        <input type="hidden" name="id" value={p.id} />
        <p className="text-muted mb-4 text-sm">
          To take someone off the team page for now, untick &ldquo;Show on the team page&rdquo;
          instead.
        </p>
        <button type="submit" className={ui.ghostSm}>
          Delete profile
        </button>
      </form>
    </>
  );
}
