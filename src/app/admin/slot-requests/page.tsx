import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin-nav";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { SLOTS_MAX } from "@/lib/project-rules";
import { requireAdmin } from "@/lib/session";
import { DecideForm } from "./decide-form";

export const metadata: Metadata = {
  title: "Slot requests",
  robots: { index: false, follow: false },
};
export const instant = false;

export default function SlotRequestsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin" title="Slot requests">
        Project leaders ask here for more team slots. Projects start with 5 and can have up to{" "}
        {SLOTS_MAX}.
      </PageHeader>
      <AdminNav current="/admin/slot-requests" />
      <Suspense fallback={<ArticleSkeleton />}>
        <Requests />
      </Suspense>
    </div>
  );
}

async function Requests() {
  await requireAdmin("/admin/slot-requests");
  const rows = await getDb().projectSlotRequest.findMany({
    where: { status: { not: "cancelled" } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      project: {
        select: {
          slug: true,
          number: true,
          title: true,
          slots: true,
          _count: { select: { memberships: true } },
        },
      },
      requestedBy: { select: { name: true } },
      decidedBy: { select: { name: true } },
    },
  });
  const pending = rows.filter((r) => r.status === "pending");
  const decided = rows.filter((r) => r.status !== "pending");

  return (
    <>
      <section aria-labelledby="pending" className="py-10">
        <SectionHeading number="01" id="pending">
          Waiting · {pending.length}
        </SectionHeading>
        {pending.length === 0 ? (
          <p className="text-muted mt-6">No requests waiting.</p>
        ) : (
          <ul className="mt-6 grid gap-6 lg:grid-cols-2">
            {pending.map((r) => (
              <li key={r.id} className="border-line bg-surface border p-5">
                <p className="tracking-caps text-accent-strong text-xs uppercase">
                  Programme {r.project.number} · asks for {r.extra} more
                </p>
                <h3 className="mt-1 text-xl leading-snug">
                  <Link
                    href={`/workspace/projects/${r.project.slug}/team`}
                    className="hover:text-accent"
                  >
                    {r.project.title}
                  </Link>
                </h3>
                <p className="text-muted mt-1 text-sm">
                  {r.requestedBy?.name ?? "The leader"} ·{" "}
                  <time dateTime={r.createdAt.toISOString()}>
                    {formatDate(r.createdAt.toISOString())}
                  </time>{" "}
                  · now {r.project._count.memberships} on the team, {r.project.slots} slots →{" "}
                  {Math.min(SLOTS_MAX, r.project.slots + r.extra)}
                </p>
                <p className="mt-3 leading-relaxed">{r.reason}</p>
                <div className="border-line mt-4 border-t pt-4">
                  <DecideForm requestId={r.id} title={r.project.title} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {decided.length > 0 ? (
        <section aria-labelledby="decided" className="border-line border-t py-10">
          <SectionHeading number="02" id="decided">
            Decided
          </SectionHeading>
          <ul className="border-line divide-line mt-6 divide-y border-y">
            {decided.map((r) => (
              <li key={r.id} className="py-3 text-sm">
                <span className="font-medium">{r.project.title}</span>{" "}
                <span className="text-muted">
                  · {r.extra} more ·{" "}
                  <span className={r.status === "approved" ? "text-accent-strong" : ""}>
                    {r.status}
                  </span>
                  {r.decidedBy ? ` by ${r.decidedBy.name}` : ""}
                  {r.adminNote ? ` · “${r.adminNote}”` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
