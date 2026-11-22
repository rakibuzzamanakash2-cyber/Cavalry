import Link from "next/link";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { FlagshipCard } from "@/components/flagship-card";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { getWorkspacePosts } from "@/data/news";
import { getWorkspaceProgrammes } from "@/data/programmes";
import { formatDate } from "@/lib/format";
import { roleLabel } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";

const comingNext = [
  { title: "Projects", detail: "Open a project, invite members and assign roles." },
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
  const [user, programmes, posts] = await Promise.all([
    getCurrentUser(),
    getWorkspaceProgrammes(),
    getWorkspacePosts(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Workspace · members only" title={`Welcome, ${user?.name ?? "member"}`}>
        Research in progress, visible only to members.{" "}
        {user ? `You are signed in as ${roleLabel[user.role].toLowerCase()}.` : null}
      </PageHeader>

      <section aria-labelledby="programmes" className="py-10 sm:py-14">
        <SectionHeading number="01" id="programmes">
          Programmes in progress
        </SectionHeading>
        {programmes.length === 0 ? (
          <p className="text-muted mt-6">No programmes yet.</p>
        ) : (
          <ul className="mt-6 grid gap-6 lg:grid-cols-2">
            {programmes.map((p) => (
              <li key={p.slug}>
                <FlagshipCard programme={p} />
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
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
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
