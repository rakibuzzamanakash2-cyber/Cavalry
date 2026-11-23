import Link from "next/link";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { StageTracker } from "@/components/stage-tracker";
import { ui } from "@/components/ui";
import { getWorkspacePosts } from "@/data/news";
import { getProjectList } from "@/data/projects";
import { formatDate } from "@/lib/format";
import { roleLabel } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";

const comingNext = [
  { title: "Teams", detail: "Team pages, member profiles and project ratings." },
  { title: "Datasets", detail: "Every dataset we use, with its GitHub or Drive link." },
];

// The dashboard depends on the signed-in member, so its content streams inside
// its own boundary (keeps navigations within /workspace instant).
export default function WorkspacePage() {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <WorkspaceDashboard />
    </Suspense>
  );
}

async function WorkspaceDashboard() {
  const [user, projects, posts] = await Promise.all([
    getCurrentUser(),
    getProjectList(),
    getWorkspacePosts(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Workspace · members only" title={`Welcome, ${user?.name ?? "member"}`}>
        Research in progress, visible only to members.{" "}
        {user ? `You are signed in as ${roleLabel[user.role].toLowerCase()}.` : null}
      </PageHeader>

      <section aria-labelledby="projects" className="py-10 sm:py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SectionHeading number="01" id="projects">
            Projects
          </SectionHeading>
          <Link href="/workspace/projects/new" className={ui.buttonSm}>
            Open a project
          </Link>
        </div>
        <p className="text-muted mt-3 max-w-3xl leading-relaxed">
          Every member can see that a project exists. Its details are visible only to its team.
        </p>
        {projects.length === 0 ? (
          <p className="text-muted mt-6">No projects yet. Open the first one.</p>
        ) : (
          <ul className="mt-6 grid gap-6 lg:grid-cols-2">
            {projects.map((p) => (
              <li key={p.id} className="border-line bg-surface flex flex-col border p-5 sm:p-6">
                <p className="tracking-caps flex flex-wrap gap-x-3 text-xs uppercase">
                  <span className="text-accent-strong">Programme {p.number}</span>
                  <span className="text-muted">{p.statusLabel}</span>
                  {p.isMine ? <span className="text-primary">Your team</span> : null}
                </p>
                <h3 className="mt-2 text-2xl leading-snug">{p.title}</h3>
                <p className="text-muted mt-1 text-sm">
                  Led by {p.leaderName ?? "no one yet"} · {p.teamSize}{" "}
                  {p.teamSize === 1 ? "person" : "people"}
                </p>
                {p.stages.length > 0 ? (
                  <StageTracker stages={p.stages} current={p.currentStage} className="mt-5" />
                ) : null}
                <p className="mt-auto pt-5">
                  {p.canView ? (
                    <Link href={`/workspace/projects/${p.slug}`} className={ui.link}>
                      Open project<span className="sr-only"> {p.title}</span>{" "}
                      <span aria-hidden>→</span>
                    </Link>
                  ) : (
                    <span className="text-muted text-sm">
                      Team only. Ask {p.leaderName ?? "an admin"} to add you.
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="updates" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="02" id="updates">
          Internal updates
        </SectionHeading>
        {posts.length === 0 ? (
          <p className="text-muted mt-6">No updates yet.</p>
        ) : (
          <ul className="border-line mt-6 divide-y border-y">
            {posts.map((post) => (
              <li key={post.slug} className="grid gap-2 py-5 md:grid-cols-12 md:gap-6">
                <p className="text-muted tracking-caps text-xs uppercase md:col-span-3 md:pt-1">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </p>
                <div className="md:col-span-9">
                  <h3 className="text-xl leading-snug">{post.title}</h3>
                  <p className="text-muted mt-1 leading-relaxed">{post.excerpt}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="next" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="03" id="next">
          Coming to the workspace
        </SectionHeading>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2">
          {comingNext.map((c) => (
            <li key={c.title} className="border-line border-t-2 pt-3">
              <h3 className="text-xl">{c.title}</h3>
              <p className="text-muted mt-1 leading-relaxed">{c.detail}</p>
            </li>
          ))}
        </ul>
        {user?.role === "admin" ? (
          <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/admin/applications"
              className="text-primary hover:text-accent tracking-caps text-xs uppercase transition-colors"
            >
              Review applications →
            </Link>
            <Link
              href="/admin/users"
              className="text-primary hover:text-accent tracking-caps text-xs uppercase transition-colors"
            >
              Manage users and roles →
            </Link>
          </p>
        ) : null}
      </section>
    </div>
  );
}
