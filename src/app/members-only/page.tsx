import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Members only", robots: { index: false } };

export default function MembersOnlyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <p className="text-accent-strong tracking-caps text-xs uppercase">Members only</p>
      <h1 className="mt-3 text-4xl leading-tight">This part of CAVALRY is private</h1>
      <p className="text-muted mt-4 text-lg leading-relaxed">
        Research in progress is confidential and visible only to members working on it.
      </p>
      <Suspense fallback={null}>
        <Status />
      </Suspense>
    </div>
  );
}

async function Status() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/sign-in?next=/workspace"
          className="bg-primary text-primary-foreground hover:bg-accent tracking-caps px-5 py-3.5 text-center text-xs uppercase transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="border-primary text-primary hover:border-accent hover:text-accent tracking-caps border px-5 py-3.5 text-center text-xs uppercase transition-colors"
        >
          Create an account
        </Link>
      </div>
    );
  }
  return (
    <div className="border-line bg-sand/40 mt-8 border p-5 sm:p-6">
      <p className="font-serif text-xl">Signed in as {user.name}</p>
      <p className="text-muted mt-2 leading-relaxed">
        Your account is not a member yet. Members join by an approved application or an invitation
        from the team. Applications open here soon; until then, see the{" "}
        <Link href="/team#join" className="text-ink hover:text-accent underline">
          open roles
        </Link>
        .
      </p>
    </div>
  );
}
