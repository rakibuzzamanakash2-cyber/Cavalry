import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin-nav";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { ui } from "@/components/ui";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Team profiles",
  robots: { index: false, follow: false },
};
export const instant = false;

export default function AdminTeamPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin" title="Team profiles">
        The people and open roles on the public team page. Workspace accounts and project teams are
        managed separately.
      </PageHeader>
      <AdminNav current="/admin/team" />
      <Suspense fallback={<ArticleSkeleton />}>
        <Lists />
      </Suspense>
    </div>
  );
}

async function Lists() {
  await requireAdmin("/admin/team");
  const db = getDb();
  const [people, roles] = await Promise.all([
    db.teamMember.findMany({
      orderBy: [{ isFounder: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
    db.openRole.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] }),
  ]);

  return (
    <>
      <section aria-labelledby="people" className="py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SectionHeading number="01" id="people">
            People
          </SectionHeading>
          <Link href="/admin/team/people/new" className={ui.buttonSm}>
            Add a person
          </Link>
        </div>
        {people.length === 0 ? (
          <p className="text-muted mt-6">No profiles yet.</p>
        ) : (
          <ul className="border-line divide-line mt-6 divide-y border-y">
            {people.map((p) => (
              <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="tracking-caps text-xs uppercase">
                    <span className={p.isActive ? "text-accent-strong" : "text-muted"}>
                      {p.isActive ? "Shown" : "Hidden"}
                    </span>
                    <span className="text-muted">
                      {p.isFounder ? " · Co-founder" : ""} · order {p.sortOrder}
                    </span>
                  </p>
                  <h3 className="mt-1 text-xl">{p.name}</h3>
                  <p className="text-muted text-sm">{p.role}</p>
                </div>
                <Link href={`/admin/team/people/${p.id}`} className={ui.link}>
                  Edit<span className="sr-only"> {p.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="roles" className="border-line border-t py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SectionHeading number="02" id="roles">
            Open roles
          </SectionHeading>
          <Link href="/admin/team/roles/new" className={ui.buttonSm}>
            Add a role
          </Link>
        </div>
        {roles.length === 0 ? (
          <p className="text-muted mt-6">No roles yet.</p>
        ) : (
          <ul className="border-line divide-line mt-6 divide-y border-y">
            {roles.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="tracking-caps text-xs uppercase">
                    <span className={r.isOpen ? "text-accent-strong" : "text-muted"}>
                      {r.isOpen ? "Open" : "Closed"}
                    </span>
                    <span className="text-muted"> · order {r.sortOrder}</span>
                  </p>
                  <h3 className="mt-1 text-xl">{r.title}</h3>
                </div>
                <Link href={`/admin/team/roles/${r.id}`} className={ui.link}>
                  Edit<span className="sr-only"> {r.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
