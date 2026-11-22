import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { getMyApplications } from "@/data/applications";
import { statusLabel } from "@/lib/applications";
import { formatDate } from "@/lib/format";
import { isMemberRole } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";
import { withdrawApplication } from "./actions";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Apply",
  description: "Apply to work with CAVALRY research in a research field.",
};

const steps = [
  "Create an account or sign in.",
  "Choose a field and tell us about yourself.",
  "An admin reviews your application.",
  "If accepted, you become a member and can see the research workspace.",
];

export default function ApplyPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Apply" title="Work with us">
        We are a small team, so we read every application carefully. Tell us which field you want to
        work in and why.
      </PageHeader>

      <div className="grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          <Suspense fallback={<ArticleSkeleton narrow />}>
            <ApplyContent />
          </Suspense>
        </div>
        <aside className="lg:col-span-4">
          <div className="border-line bg-sand/40 border p-5 sm:p-6">
            <h2 className="text-2xl">How it works</h2>
            <ol className="mt-4 space-y-3">
              {steps.map((s, i) => (
                <li key={s} className="flex gap-3 leading-relaxed">
                  <span className="text-accent font-serif text-xl leading-none">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

async function ApplyContent() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="border-line border p-5 sm:p-6">
        <p className="font-serif text-xl">Sign in to apply</p>
        <p className="text-muted mt-2 leading-relaxed">
          You need an account so we can reply and keep track of your application.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-up?next=/apply"
            className="bg-primary text-primary-foreground hover:bg-accent tracking-caps px-5 py-3.5 text-center text-xs uppercase transition-colors"
          >
            Create an account
          </Link>
          <Link
            href="/sign-in?next=/apply"
            className="border-primary text-primary hover:border-accent hover:text-accent tracking-caps border px-5 py-3.5 text-center text-xs uppercase transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (isMemberRole(user.role)) {
    return (
      <div className="border-line border p-5 sm:p-6">
        <p className="font-serif text-xl">You&apos;re already a member</p>
        <p className="text-muted mt-2 leading-relaxed">There&apos;s no need to apply.</p>
        <Link
          href="/workspace"
          className="text-primary hover:text-accent tracking-caps mt-4 inline-block text-xs uppercase transition-colors"
        >
          Go to the workspace →
        </Link>
      </div>
    );
  }

  const applications = await getMyApplications();
  const pending = applications.find((a) => a.status === "pending");

  return (
    <div className="space-y-10">
      {pending ? (
        <div className="border-line border p-5 sm:p-6" aria-live="polite">
          <p className="text-accent-strong tracking-caps text-xs uppercase">
            {statusLabel.pending}
          </p>
          <p className="mt-2 font-serif text-xl">Your application for {pending.field}</p>
          <p className="text-muted mt-2 leading-relaxed">
            Sent on {formatDate(pending.createdAt.slice(0, 10))}. We&apos;ll update this page when
            it has been reviewed.
          </p>
          <form action={withdrawApplication} className="mt-4">
            <input type="hidden" name="id" value={pending.id} />
            <button
              type="submit"
              className="text-muted hover:text-accent tracking-caps text-xs uppercase underline"
            >
              Withdraw application
            </button>
          </form>
        </div>
      ) : (
        <ApplyForm />
      )}

      {applications.some((a) => a.status !== "pending") ? (
        <section aria-labelledby="history">
          <h2 id="history" className="text-2xl">
            Your earlier applications
          </h2>
          <ul className="border-line divide-line mt-4 divide-y border-y">
            {applications
              .filter((a) => a.status !== "pending")
              .map((a) => (
                <li key={a.id} className="py-4">
                  <p className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium">{a.field}</span>
                    <span className="text-muted tracking-caps text-xs uppercase">
                      {statusLabel[a.status]} · {formatDate(a.createdAt.slice(0, 10))}
                    </span>
                  </p>
                  {a.reviewNote ? (
                    <p className="text-muted mt-1 text-sm leading-relaxed">
                      Note from the team: {a.reviewNote}
                    </p>
                  ) : null}
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
