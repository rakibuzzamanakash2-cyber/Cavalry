import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { ui } from "@/components/ui";
import { isMemberRole } from "@/lib/roles";
import { safeNext } from "@/lib/safe-redirect";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Account created", robots: { index: false } };

// Shown after sign-up (email or Google). The confirmation email goes out when
// the account is created; see src/lib/mail/account-created.ts.
export default function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <Suspense fallback={<ArticleSkeleton narrow />}>
        <Welcome searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Welcome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser("/welcome");
  const next = safeNext((await searchParams).next);
  const member = isMemberRole(user.role);

  return (
    <div className="border-line bg-surface border p-6 shadow-[6px_6px_0_0_var(--color-sand)] sm:p-10">
      <p className="text-accent-strong tracking-caps text-xs uppercase">Account created</p>
      <h1 className="mt-3 text-4xl leading-tight">Welcome, {user.name.split(" ")[0]}</h1>
      <p className="mt-4 text-lg leading-relaxed">
        You have successfully created your CAVALRY account. We&apos;ve sent a confirmation to{" "}
        <span className="font-medium break-all">{user.email}</span>.
      </p>

      <dl className="border-line divide-line mt-8 divide-y border-y">
        <div className="grid gap-1 py-3 sm:grid-cols-3">
          <dt className={ui.label}>Your ID</dt>
          <dd className="font-mono text-lg tracking-wide sm:col-span-2" data-testid="welcome-uid">
            {user.uid}
          </dd>
        </div>
        {user.username ? (
          <div className="grid gap-1 py-3 sm:grid-cols-3">
            <dt className={ui.label}>Username</dt>
            <dd className="sm:col-span-2">@{user.username}</dd>
          </div>
        ) : null}
      </dl>
      <p className="text-muted mt-3 text-sm">
        You can sign in with your email, your ID{user.username ? " or your username" : ""}.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {next !== "/" ? (
          <Link href={next} className={ui.button}>
            Continue
          </Link>
        ) : member ? (
          <Link href="/workspace" className={ui.button}>
            Open the workspace
          </Link>
        ) : (
          <Link href="/apply" className={ui.button}>
            Apply to join
          </Link>
        )}
        <Link
          href="/account"
          className="border-primary text-primary hover:bg-sand border px-5 py-3 text-center text-sm font-medium transition-colors"
        >
          Your account
        </Link>
      </div>
    </div>
  );
}
