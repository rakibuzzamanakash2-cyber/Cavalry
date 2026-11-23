import Link from "next/link";
import { ui } from "@/components/ui";

/** What a member outside the team sees: that the project exists, nothing more. */
export function RestrictedProject({
  title,
  number,
  leaderName,
}: {
  title: string;
  number: string;
  leaderName: string | null;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <p className="text-accent-strong tracking-caps text-xs uppercase">
        Programme {number} · team only
      </p>
      <h1 className="mt-3 text-4xl leading-tight">{title}</h1>
      <p className="text-muted mt-4 text-lg leading-relaxed">
        The details of this project are visible only to its team.{" "}
        {leaderName
          ? `If you would like to work on it, ask ${leaderName}, the team leader, to add you.`
          : "If you would like to work on it, ask an admin to add you."}
      </p>
      <p className="mt-8">
        <Link href="/workspace" className={ui.link}>
          ← Back to the workspace
        </Link>
      </p>
    </div>
  );
}
