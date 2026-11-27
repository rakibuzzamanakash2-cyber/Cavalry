import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ui } from "@/components/ui";
import { YourAccess } from "@/components/your-access";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Private area", robots: { index: false } };

// Where people land when a page needs more access than they have
// (see requireMember and requireAdmin in src/lib/session.ts).
export default function MembersOnlyPage() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <Suspense
        fallback={<h1 className="text-muted text-2xl leading-tight">Checking your access…</h1>}
      >
        <Status />
      </Suspense>
    </div>
  );
}

async function Status() {
  const user = await getCurrentUser();

  // Members (not admins) end up here from admin pages.
  if (user?.role === "member") {
    return (
      <div className="max-w-2xl">
        <p className="text-accent-strong tracking-caps text-xs uppercase">Admins only</p>
        <h1 className="mt-3 text-4xl leading-tight">This page is for admins</h1>
        <p className="text-muted mt-4 text-lg leading-relaxed">
          You&apos;re a member, so the research workspace is open to you, but site administration is
          limited to admins.
        </p>
        <Link href="/workspace" className={`${ui.button} mt-8 inline-block`}>
          Open the workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <p className="text-accent-strong tracking-caps text-xs uppercase">Members only</p>
        <h1 className="mt-3 text-4xl leading-tight">This part of CAVALRY is private</h1>
        <p className="text-muted mt-4 text-lg leading-relaxed">
          Research in progress is confidential and visible only to members working on it.
        </p>
        {user ? (
          <div className="border-line bg-sand/40 mt-8 border p-5 sm:p-6">
            <p className="font-serif text-xl">Signed in as {user.name}</p>
            <p className="text-muted mt-2 leading-relaxed">
              Your account is not a member yet. Members join by an approved application or an
              invitation from a project leader.
            </p>
            <Link href="/apply" className={`${ui.button} mt-4 inline-block`}>
              Apply or check your application
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login?next=/workspace" className={ui.button}>
              Log in
            </Link>
            <Link
              href="/registration?next=/workspace"
              className="border-primary text-primary hover:bg-sand border px-5 py-3 text-center text-sm font-medium transition-colors"
            >
              Create an account
            </Link>
          </div>
        )}
      </div>
      <YourAccess role={user?.role ?? null} />
    </div>
  );
}
