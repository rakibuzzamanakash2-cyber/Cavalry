import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin-nav";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { removeSubscriber } from "./actions";

export const metadata: Metadata = { title: "Subscribers", robots: { index: false, follow: false } };
export const instant = false;

export default function AdminSubscribersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin" title="Newsletter subscribers">
        People who asked for research updates by email. Download the list to send an update from a
        mail service; each row includes that person&apos;s unsubscribe link.
      </PageHeader>
      <AdminNav current="/admin/subscribers" />
      <Suspense fallback={<ArticleSkeleton />}>
        <List />
      </Suspense>
    </div>
  );
}

async function List() {
  await requireAdmin("/admin/subscribers");
  const rows = await getDb().newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg" data-testid="subscriber-count">
          {rows.length} {rows.length === 1 ? "subscriber" : "subscribers"}
        </p>
        {rows.length > 0 ? (
          <a href="/admin/subscribers/export" className={ui.button} download>
            Download CSV
          </a>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className="text-muted mt-6">No one has subscribed yet.</p>
      ) : (
        <ul className="border-line divide-line mt-6 divide-y border-y">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="break-all">{r.email}</p>
                <p className="text-muted text-xs">
                  Since {formatDate(r.createdAt.toISOString().slice(0, 10))}
                </p>
              </div>
              <form action={removeSubscriber}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="text-muted hover:text-accent-strong text-sm">
                  Remove<span className="sr-only"> {r.email}</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
