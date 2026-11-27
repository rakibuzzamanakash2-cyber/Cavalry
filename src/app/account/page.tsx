import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { isMemberRole, roleLabel } from "@/lib/roles";
import { requireUser } from "@/lib/session";
import { YourAccess } from "@/components/your-access";
import { getMyApplications } from "@/data/applications";
import { statusLabel } from "@/lib/applications";
import { UsernameForm } from "./username-form";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

// Depends on who is signed in.
export const instant = false;

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Account" title="Your account">
        Your ID never changes. You can sign in with your ID, your email or a username you choose.
      </PageHeader>
      <Suspense fallback={<ArticleSkeleton narrow />}>
        <AccountDetails />
      </Suspense>
    </div>
  );
}

async function AccountDetails() {
  const user = await requireUser("/account");
  const member = isMemberRole(user.role);
  const latest = member ? undefined : (await getMyApplications())[0];

  return (
    <div className="grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12">
      <section aria-labelledby="details" className="min-w-0 lg:col-span-7">
        <h2 id="details" className="text-2xl">
          Sign-in details
        </h2>
        <dl className="border-line divide-line mt-5 divide-y border-y">
          <div className="grid gap-1 py-4 sm:grid-cols-3">
            <dt className={ui.label}>ID</dt>
            <dd className="font-mono text-lg tracking-wide sm:col-span-2" data-testid="account-uid">
              {user.uid}
            </dd>
          </div>
          <div className="grid gap-1 py-4 sm:grid-cols-3">
            <dt className={ui.label}>Name</dt>
            <dd className="sm:col-span-2">{user.name}</dd>
          </div>
          <div className="grid gap-1 py-4 sm:grid-cols-3">
            <dt className={ui.label}>Email</dt>
            <dd className="break-all sm:col-span-2">{user.email}</dd>
          </div>
          <div className="grid gap-1 py-4 sm:grid-cols-3">
            <dt className={ui.label}>Access</dt>
            <dd className="sm:col-span-2">{roleLabel[user.role]}</dd>
          </div>
        </dl>
        <div className="mt-8">
          <UsernameForm current={user.username} />
        </div>
      </section>

      <aside className="lg:col-span-5">
        <div className="border-line bg-sand/40 border p-5 sm:p-6">
          {member ? (
            <>
              <h2 className="text-2xl">You&apos;re a member</h2>
              <p className="text-muted mt-2 leading-relaxed">
                You can see the research workspace, your projects, the team and datasets.
              </p>
              <Link href="/workspace" className={`${ui.button} mt-5 inline-block`}>
                Open the workspace
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl">Not a member yet</h2>
              {latest ? (
                <p className="mt-2 leading-relaxed" data-testid="application-status">
                  Your application ({latest.field}):{" "}
                  <span className="font-medium">{statusLabel[latest.status]}</span>
                  {latest.status === "pending" ? ". We'll review it soon." : "."}
                </p>
              ) : (
                <p className="text-muted mt-2 leading-relaxed">
                  Members join through an accepted application or an invite link from a project
                  leader. Once you&apos;re in, the research workspace opens up.
                </p>
              )}
              <Link href="/apply" className={`${ui.button} mt-5 inline-block`}>
                {latest ? "See your application" : "Apply to join"}
              </Link>
            </>
          )}
        </div>
      </aside>

      <div className="border-line border-t pt-10 lg:col-span-12">
        <YourAccess role={user.role} />
      </div>
    </div>
  );
}
