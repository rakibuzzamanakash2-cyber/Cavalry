import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin-nav";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { outputStatusLabel, outputTypeLabel } from "@/data/publications";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Publications",
  robots: { index: false, follow: false },
};
export const instant = false;

export default function AdminPublicationsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin" title="Publications">
        Papers, datasets, software and briefs. Only outputs marked published appear on the public
        site; the rest are visible to members.
      </PageHeader>
      <AdminNav current="/admin/publications" />
      <Suspense fallback={<ArticleSkeleton />}>
        <List />
      </Suspense>
    </div>
  );
}

async function List() {
  await requireAdmin("/admin/publications");
  const rows = await getDb().publication.findMany({
    orderBy: [{ year: { sort: "desc", nulls: "first" } }, { sortOrder: "asc" }, { title: "asc" }],
  });
  return (
    <>
      <p className="pt-8">
        <Link href="/admin/publications/new" className={ui.button}>
          Add a publication
        </Link>
      </p>
      {rows.length === 0 ? (
        <p className="text-muted mt-8">No publications yet.</p>
      ) : (
        <ul className="border-line divide-line mt-8 divide-y border-y">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="tracking-caps text-xs uppercase">
                  <span className={r.status === "published" ? "text-accent-strong" : "text-muted"}>
                    {outputStatusLabel[r.status]}
                  </span>{" "}
                  <span className="text-muted">
                    · {outputTypeLabel[r.type]}
                    {r.year ? ` · ${r.year}` : ""}
                  </span>
                </p>
                <h2 className="mt-1 text-xl leading-snug">{r.title}</h2>
                <p className="text-muted text-sm">{r.authors}</p>
              </div>
              <Link href={`/admin/publications/${r.id}`} className={ui.link}>
                Edit<span className="sr-only"> {r.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
