import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin-nav";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { licenceOf } from "@/lib/citation";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PublishForm } from "./publish-form";

export const metadata: Metadata = { title: "Datasets", robots: { index: false, follow: false } };
export const instant = false;

export default function AdminDatasetsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin" title="Datasets">
        Members add datasets in the workspace. Publishing one lists it in the public{" "}
        <Link href="/data" className="text-ink hover:text-accent underline">
          data catalogue
        </Link>
        . A dataset whose project is still in progress can&apos;t be published.
      </PageHeader>
      <AdminNav current="/admin/datasets" />
      <Suspense fallback={<ArticleSkeleton />}>
        <List />
      </Suspense>
    </div>
  );
}

async function List() {
  await requireAdmin("/admin/datasets");
  const rows = await getDb().dataset.findMany({
    include: { project: { select: { number: true, title: true, status: true } } },
    orderBy: [{ isPublic: "desc" }, { name: "asc" }],
  });
  if (rows.length === 0) {
    return (
      <p className="text-muted mt-8">
        No datasets yet. Members add them in the{" "}
        <Link href="/workspace/datasets" className={ui.link}>
          workspace
        </Link>
        .
      </p>
    );
  }
  return (
    <ul className="border-line divide-line mt-8 divide-y border-y" data-testid="admin-datasets">
      {rows.map((d) => (
        <li key={d.id} className="grid gap-3 py-5 md:grid-cols-12 md:items-start md:gap-6">
          <div className="min-w-0 md:col-span-7">
            <p className="text-xs">
              {d.isPublic ? (
                <span className="text-accent-strong tracking-caps uppercase">
                  Public · {licenceOf(d.licence)?.name ?? "No licence"}
                </span>
              ) : (
                <span className="text-muted tracking-caps uppercase">Members only</span>
              )}
            </p>
            <h2 className="mt-1 text-xl leading-snug">
              {d.isPublic && d.slug ? (
                <Link href={`/data/${d.slug}`} className="hover:text-accent-strong">
                  {d.name}
                </Link>
              ) : (
                d.name
              )}
            </h2>
            <p className="text-muted mt-1 text-sm">
              {d.project ? `Programme ${d.project.number}: ${d.project.title}` : "Shared dataset"}
            </p>
          </div>
          <div className="md:col-span-5">
            <PublishForm
              id={d.id}
              name={d.name}
              isPublic={d.isPublic}
              licence={d.licence ?? ""}
              blocked={
                d.project && d.project.status !== "completed"
                  ? "Project in progress: publish once it is completed."
                  : undefined
              }
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
