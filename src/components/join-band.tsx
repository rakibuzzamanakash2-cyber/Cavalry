import Link from "next/link";
import { Suspense } from "react";
import { getProjectList } from "@/data/projects";
import { isMemberRole } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";

const solid =
  "bg-primary-foreground text-primary hover:bg-sand px-5 py-3 text-sm font-medium transition-colors";
const outline =
  "border-primary-foreground/60 text-primary-foreground hover:border-primary-foreground border px-5 py-3 text-sm font-medium transition-colors";
const wrap =
  "mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center";

/**
 * The closing band on the home page. Visitors and signed-in non-members are
 * invited to join; members (who already belong) get their projects and the
 * workspace instead.
 */
export function JoinBand() {
  return (
    <Suspense fallback={<section aria-hidden className="bg-primary min-h-48" />}>
      <JoinBandInner />
    </Suspense>
  );
}

async function JoinBandInner() {
  const user = await getCurrentUser();

  if (user && isMemberRole(user.role)) {
    const mine = (await getProjectList()).filter((p) => p.isMine).slice(0, 3);
    return (
      <section aria-labelledby="join-title" className="bg-primary text-primary-foreground">
        <div className={wrap}>
          <div>
            <h2 id="join-title" className="text-primary-foreground text-3xl leading-tight">
              Welcome back, {user.name.split(" ")[0]}
            </h2>
            {mine.length > 0 ? (
              <ul className="mt-3 space-y-1">
                {mine.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/workspace/projects/${p.slug}`}
                      className="underline-offset-4 opacity-90 hover:underline hover:opacity-100"
                    >
                      Programme {p.number}: {p.title}
                    </Link>
                    <span className="opacity-70"> · {p.statusLabel}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 max-w-xl opacity-90">
                You&apos;re not on a project yet. The workspace lists every project and its leader.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/workspace" className={solid}>
              Open the workspace
            </Link>
            <Link href="/workspace/team" className={outline}>
              Team & ratings
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="join-title" className="bg-primary text-primary-foreground">
      <div className={wrap}>
        <div>
          <h2 id="join-title" className="text-primary-foreground text-3xl leading-tight">
            Work with us
          </h2>
          <p className="mt-2 max-w-xl opacity-90">
            We are looking for researchers, data engineers and students who care about getting the
            evidence right.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/apply" className={solid}>
            {user ? "Apply or check your application" : "Apply to join"}
          </Link>
          <Link href="/contact" className={outline}>
            Get in touch
          </Link>
        </div>
      </div>
    </section>
  );
}
