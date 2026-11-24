import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { RestrictedProject } from "@/components/restricted-project";
import { ui } from "@/components/ui";
import { getAddableMembers, getProjectDetail } from "@/data/projects";
import { formatDate } from "@/lib/format";
import { makeLeader, removeMember, revokeInvite } from "../../actions";
import { Stars } from "@/components/stars";
import { AddMemberForm, InviteForm, RatingForm, RoleEditForm } from "./team-forms";

export const metadata: Metadata = {
  title: "Project team",
  robots: { index: false, follow: false },
};

// The team can see this page; only the leader and admins get the controls.
export default function ProjectTeamPage({ params }: PageProps<"/workspace/projects/[slug]/team">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <TeamView params={params} />
    </Suspense>
  );
}

async function TeamView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await getProjectDetail(slug);
  if (detail.kind === "missing") notFound();
  if (detail.kind === "restricted") return <RestrictedProject {...detail} />;

  const { access, programme, team, invites } = detail;
  const manage = access.canManage;
  const candidates = manage ? await getAddableMembers(access) : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow={`Programme ${programme.number} · team`} title={programme.title}>
        {manage
          ? "Add members, set their roles, rate their work on this project (1–5) and invite new people. Only you and admins can change this."
          : "Who is working on this project. Only the team leader and admins can change roles and ratings."}
      </PageHeader>

      <section aria-labelledby="members" className="py-10">
        <SectionHeading number="01" id="members">
          Members
        </SectionHeading>
        <ul className="border-line divide-line mt-6 divide-y border-y">
          {team.map((m) => (
            <li
              key={m.membershipId}
              className={
                manage
                  ? "flex flex-col gap-3 py-5"
                  : "grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              }
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {m.name}
                  {m.isLeader ? (
                    <span className="text-accent-strong tracking-caps ml-2 text-xs uppercase">
                      Team leader
                    </span>
                  ) : null}
                  {m.userId === access.user.id ? (
                    <span className="text-muted ml-2 text-sm">(you)</span>
                  ) : null}
                </p>
                <p className="text-muted text-sm break-all">
                  {m.email} · joined <time dateTime={m.joinedAt}>{formatDate(m.joinedAt)}</time>
                </p>
                <p className="mt-2">
                  <Stars value={m.rating} size="sm" />
                </p>
              </div>
              {manage ? (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <RoleEditForm membershipId={m.membershipId} name={m.name} role={m.role} />
                  {m.userId !== access.user.id ? (
                    <RatingForm membershipId={m.membershipId} name={m.name} rating={m.rating} />
                  ) : null}
                  {!m.isLeader ? (
                    <>
                      <form action={makeLeader}>
                        <input type="hidden" name="membershipId" value={m.membershipId} />
                        <button type="submit" className={ui.ghostSm}>
                          Make leader<span className="sr-only"> ({m.name})</span>
                        </button>
                      </form>
                      <form action={removeMember}>
                        <input type="hidden" name="membershipId" value={m.membershipId} />
                        <button type="submit" className={ui.ghostSm}>
                          Remove<span className="sr-only"> {m.name}</span>
                        </button>
                      </form>
                    </>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm">{m.role}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {manage ? (
        <>
          <section aria-labelledby="add" className="border-line border-t py-10">
            <SectionHeading number="02" id="add">
              Add a member
            </SectionHeading>
            <div className="mt-6">
              <AddMemberForm projectId={access.projectId} candidates={candidates} />
            </div>
          </section>

          <section aria-labelledby="invite" className="border-line border-t py-10">
            <SectionHeading number="03" id="invite">
              Invite someone new
            </SectionHeading>
            <p className="text-muted mt-3 max-w-3xl leading-relaxed">
              For people who are not members yet. Accepting the link makes them a CAVALRY member and
              puts them on this project with the role you set.
            </p>
            <div className="mt-6">
              <InviteForm projectId={access.projectId} />
            </div>
            {invites.length > 0 ? (
              <>
                <h3 className="mt-10 text-lg">Open invites</h3>
                <ul className="border-line divide-line mt-3 divide-y border-y">
                  {invites.map((i) => (
                    <li
                      key={i.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <p className="text-sm">
                        <span className="font-medium">{i.role}</span>
                        {i.note ? <span className="text-muted"> · {i.note}</span> : null}
                        <span className="text-muted">
                          {" "}
                          · expires <time dateTime={i.expiresAt}>{formatDate(i.expiresAt)}</time>
                        </span>
                      </p>
                      <form action={revokeInvite}>
                        <input type="hidden" name="inviteId" value={i.id} />
                        <button type="submit" className={ui.ghostSm}>
                          Revoke<span className="sr-only"> invite for {i.role}</span>
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        </>
      ) : null}

      <p className="border-line border-t pt-8">
        <Link href={`/workspace/projects/${programme.slug}`} className={ui.link}>
          ← Back to the project
        </Link>
      </p>
    </div>
  );
}
