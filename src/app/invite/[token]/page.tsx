import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { ui } from "@/components/ui";
import { getInvite } from "@/data/invites";
import { AcceptForm } from "./accept-form";

export const metadata: Metadata = {
  title: "Project invite",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// Depends on who is signed in and on the token, so it never joins a shell.
export const instant = false;

export default function InvitePage({ params }: PageProps<"/invite/[token]">) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <Suspense fallback={<ArticleSkeleton />}>
        <InviteView params={params} />
      </Suspense>
    </div>
  );
}

async function InviteView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getInvite(token);

  if (invite.kind === "invalid") {
    return (
      <>
        <p className="text-accent-strong tracking-caps text-xs uppercase">Project invite</p>
        <h1 className="mt-3 text-4xl leading-tight">This invite link is not valid</h1>
        <p className="text-muted mt-4 text-lg leading-relaxed">
          It may have been used already, revoked or expired. Ask the team leader for a new link.
        </p>
        <p className="mt-8">
          <Link href="/" className={ui.link}>
            ← Home
          </Link>
        </p>
      </>
    );
  }

  if (invite.kind === "already") {
    return (
      <>
        <p className="text-accent-strong tracking-caps text-xs uppercase">Project invite</p>
        <h1 className="mt-3 text-4xl leading-tight">You are already on this project</h1>
        <p className="mt-8">
          <Link href={`/workspace/projects/${invite.slug}`} className={ui.link}>
            Go to {invite.title} →
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <p className="text-accent-strong tracking-caps text-xs uppercase">
        Project invite · Programme {invite.number}
      </p>
      <h1 className="mt-3 text-4xl leading-tight">{invite.title}</h1>
      <p className="text-muted mt-4 text-lg leading-relaxed">
        {invite.invitedBy ? `${invite.invitedBy} has invited you` : "You have been invited"} to join
        this project as <span className="text-ink font-medium">{invite.role}</span>. Accepting makes
        you a CAVALRY member and gives you access to the project&apos;s work.
      </p>
      <AcceptForm token={token} />
    </>
  );
}
