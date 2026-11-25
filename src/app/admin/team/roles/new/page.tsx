import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/session";
import { createRole } from "../../actions";
import { RoleForm } from "../../team-forms";

export const metadata: Metadata = { title: "Add a role", robots: { index: false, follow: false } };
export const instant = false;

export default function NewRolePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin · team" title="Add an open role" />
      <div className="pt-8">
        <Suspense fallback={<ArticleSkeleton />}>
          <Form />
        </Suspense>
      </div>
    </div>
  );
}

async function Form() {
  await requireAdmin("/admin/team/roles/new");
  return (
    <RoleForm
      action={createRole}
      submitLabel="Save role"
      initial={{ title: "", background: "", owns: "", isOpen: true, sortOrder: "0" }}
    />
  );
}
