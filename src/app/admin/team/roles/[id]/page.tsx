import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deleteRole, updateRole } from "../../actions";
import { RoleForm } from "../../team-forms";

export const metadata: Metadata = { title: "Edit role", robots: { index: false, follow: false } };
export const instant = false;

export default function EditRolePage({ params }: PageProps<"/admin/team/roles/[id]">) {
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
  await requireAdmin(`/admin/team/roles/${id}`);
  if (!z.uuid().safeParse(id).success) notFound();
  const r = await getDb().openRole.findUnique({ where: { id } });
  if (!r) notFound();
  return (
    <>
      <PageHeader eyebrow="Admin · team" title={`Edit: ${r.title}`} />
      <div className="pt-8">
        <RoleForm
          action={updateRole}
          id={r.id}
          submitLabel="Save changes"
          initial={{
            title: r.title,
            background: r.background,
            owns: r.owns,
            isOpen: r.isOpen,
            sortOrder: String(r.sortOrder),
          }}
        />
      </div>
      <form action={deleteRole} className="border-line mt-12 border-t pt-8">
        <input type="hidden" name="id" value={r.id} />
        <button type="submit" className={ui.ghostSm}>
          Delete role
        </button>
      </form>
    </>
  );
}
