import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { PeopleFilter } from "@/components/people-filter";
import { Stars } from "@/components/stars";
import { ui } from "@/components/ui";
import { getTeamDirectory } from "@/data/directory";
import { formatDate } from "@/lib/format";
import {
  byTierThenName,
  cleanQuery,
  countTiers,
  matchesQuery,
  tierLabel,
  toTierFilter,
} from "@/lib/people";
import { positionLabel } from "@/lib/project-rules";
import { tierBadge } from "@/lib/tier-badge";

export const metadata: Metadata = {
  title: "Team & ratings",
  robots: { index: false, follow: false },
};

// Members only (the workspace layout checks, and so does getTeamDirectory).
export default function TeamDirectoryPage({ searchParams }: PageProps<"/workspace/team">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Workspace · team" title="Team & ratings">
        Everyone working at CAVALRY, the projects they are on and their overall rating: the average
        of the 1–5 ratings their team leaders gave them, project by project.
      </PageHeader>
      <Suspense fallback={<ArticleSkeleton />}>
        <Directory searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const directoryTiers = ["admin", "leader", "member"] as const;

async function Directory({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { people: everyone, teams } = await getTeamDirectory();
  const params = await searchParams;
  const query = cleanQuery(params.q);
  const show = toTierFilter(params.show);
  const matched = everyone
    .filter((p) => matchesQuery(query, [p.name, p.username, p.uid]))
    .sort(byTierThenName);
  const counts = countTiers(matched);
  const people = show === "all" ? matched : matched.filter((p) => p.tier === show);

  return (
    <>
      <section aria-labelledby="people" className="py-10">
        <SectionHeading number="01" id="people">
          People · {everyone.length}
        </SectionHeading>
        <div className="mt-6">
          <PeopleFilter
            action="/workspace/team"
            query={query}
            show={show}
            tiers={directoryTiers}
            counts={counts}
            total={matched.length}
            placeholder="Name, username or ID"
          />
        </div>
        {people.length === 0 ? (
          <p className="text-muted mt-6">No one matches{query ? ` \u201c${query}\u201d` : ""}.</p>
        ) : null}
        <ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {people.map((p) => (
            <li
              key={p.id}
              id={`person-${p.id}`}
              className="border-line bg-surface flex scroll-mt-24 flex-col border p-5"
            >
              <p className="text-muted flex flex-wrap items-center gap-2 text-xs">
                <span className={tierBadge[p.tier]}>{tierLabel[p.tier]}</span>
                <span>
                  since <time dateTime={p.memberSince}>{formatDate(p.memberSince)}</time>
                </span>
              </p>
              <h3 className="mt-2 text-xl">
                {p.name}
                {p.isYou ? <span className="text-muted ml-2 text-sm">(you)</span> : null}
              </h3>
              <p className="text-muted font-mono text-xs">
                {p.uid}
                {p.username ? ` \u00b7 @${p.username}` : ""}
              </p>
              <div className="mt-3">
                <Stars value={p.overall} />
                <p className="text-muted mt-1 text-xs">
                  {p.ratedCount === 0
                    ? "No project ratings yet"
                    : `Overall, from ${p.ratedCount} project ${p.ratedCount === 1 ? "rating" : "ratings"}`}
                </p>
              </div>
              {p.projects.length > 0 ? (
                <ul className="border-line mt-4 space-y-2 border-t pt-4 text-sm">
                  {p.projects.map((pr) => (
                    <li key={pr.slug}>
                      {pr.canView ? (
                        <Link
                          href={`/workspace/projects/${pr.slug}`}
                          className="hover:text-accent font-medium transition-colors"
                        >
                          {pr.title}
                        </Link>
                      ) : (
                        <span className="font-medium">{pr.title}</span>
                      )}
                      <span className="text-muted">
                        {" "}
                        · {pr.position === "member" ? "" : `${positionLabel[pr.position]}, `}
                        {pr.role}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted border-line mt-4 border-t pt-4 text-sm">
                  Not on a project yet.
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="teams" className="border-line border-t py-10">
        <SectionHeading number="02" id="teams">
          Project teams · {teams.length}
        </SectionHeading>
        {teams.length === 0 ? (
          <p className="text-muted mt-6">No projects yet.</p>
        ) : (
          <ul className="border-line divide-line mt-6 divide-y border-y">
            {teams.map((t) => (
              <li key={t.id} className="grid gap-3 py-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <div>
                  <p className="tracking-caps text-xs uppercase">
                    <span className="text-accent-strong">Programme {t.number}</span>{" "}
                    <span className="text-muted">· {t.statusLabel}</span>
                  </p>
                  <h3 className="mt-1 text-lg leading-snug">
                    {t.canView ? (
                      <Link
                        href={`/workspace/projects/${t.slug}`}
                        className="hover:text-accent transition-colors"
                      >
                        {t.title}
                      </Link>
                    ) : (
                      t.title
                    )}
                  </h3>
                  <p className="text-muted text-sm">Led by {t.leaderName ?? "no one yet"}</p>
                </div>
                <ul className="flex flex-wrap content-start gap-x-6 gap-y-2 text-sm">
                  {t.members.map((m) => (
                    <li key={m.userId}>
                      <a
                        href={`#person-${m.userId}`}
                        className="hover:text-accent font-medium transition-colors"
                      >
                        {m.name}
                      </a>
                      <span className="text-muted">
                        {" "}
                        · {m.position === "member" ? "" : `${positionLabel[m.position]}, `}
                        {m.role}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="border-line border-t pt-8">
        <Link href="/workspace" className={ui.link}>
          ← Back to the workspace
        </Link>
      </p>
    </>
  );
}
