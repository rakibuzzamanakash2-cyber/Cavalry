import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { getApplicationsForReview } from "@/data/applications";
import { statusLabel } from "@/lib/applications";
import { formatDate } from "@/lib/format";
import { ReviewForm } from "./review-form";

export const metadata: Metadata = {
  title: "Applications",
  robots: { index: false, follow: false },
};

// Depends on who is signed in; see the note in app/workspace/layout.tsx.
export const instant = false;

export default function AdminApplicationsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Admin" title="Applications">
        Accepting an application makes the person a member straight away.{" "}
        <Link href="/admin/users" className="text-ink hover:text-accent underline">
          Users and roles
        </Link>
      </PageHeader>
      <Suspense fallback={<ArticleSkeleton />}>
        <ApplicationList />
      </Suspense>
    </div>
  );
}

async function ApplicationList() {
  const applications = await getApplicationsForReview();
  const pending = applications.filter((a) => a.status === "pending").length;

  if (applications.length === 0) {
    return <p className="text-muted py-10">No applications yet.</p>;
  }

  return (
    <section aria-label="Applications" className="py-8 sm:py-10">
      <p className="text-muted text-sm">
        {pending} waiting for review · {applications.length} in total
      </p>
      <ul className="mt-4 space-y-6">
        {applications.map((a) => (
          <li key={a.id}>
            <article
              aria-label={`Application from ${a.applicant.name}`}
              className={`border-line border p-5 sm:p-6 ${a.status === "pending" ? "bg-surface shadow-[6px_6px_0_0_var(--color-sand)]" : "opacity-80"}`}
            >
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="text-2xl leading-tight">{a.applicant.name}</h2>
                  <p className="text-muted text-sm break-all">{a.applicant.email}</p>
                </div>
                <p className="tracking-caps text-xs uppercase">
                  <span className={a.status === "pending" ? "text-accent-strong" : "text-muted"}>
                    {statusLabel[a.status]}
                  </span>
                  <span className="text-muted"> · {formatDate(a.createdAt.slice(0, 10))}</span>
                </p>
              </header>

              <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-[9rem_1fr]">
                <dt className="text-muted tracking-caps text-xs uppercase sm:pt-0.5">Field</dt>
                <dd>{a.field}</dd>
                <dt className="text-muted tracking-caps text-xs uppercase sm:pt-0.5">
                  Hours / week
                </dt>
                <dd>{a.hoursPerWeek}</dd>
                <dt className="text-muted tracking-caps text-xs uppercase sm:pt-0.5">Motivation</dt>
                <dd className="leading-relaxed whitespace-pre-line">{a.motivation}</dd>
                <dt className="text-muted tracking-caps text-xs uppercase sm:pt-0.5">Background</dt>
                <dd className="leading-relaxed whitespace-pre-line">{a.background}</dd>
                {a.sampleUrl ? (
                  <>
                    <dt className="text-muted tracking-caps text-xs uppercase sm:pt-0.5">
                      Work sample
                    </dt>
                    <dd>
                      <a
                        href={a.sampleUrl}
                        rel="noopener noreferrer nofollow"
                        target="_blank"
                        className="hover:text-accent break-all underline"
                      >
                        {a.sampleUrl}
                      </a>
                    </dd>
                  </>
                ) : null}
              </dl>

              <div className="border-line mt-5 border-t pt-4">
                {a.status === "pending" ? (
                  <ReviewForm id={a.id} applicantName={a.applicant.name} />
                ) : (
                  <p className="text-muted text-sm">
                    {statusLabel[a.status]}
                    {a.reviewer ? ` by ${a.reviewer.name}` : ""}
                    {a.reviewedAt ? ` on ${formatDate(a.reviewedAt.slice(0, 10))}` : ""}
                    {a.reviewNote ? ` · Note: ${a.reviewNote}` : ""}
                  </p>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
