import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { RestrictedProject } from "@/components/restricted-project";
import { Stars } from "@/components/stars";
import { ui } from "@/components/ui";
import { getAddableMembers, getProjectDetail, type TeamMemberRow } from "@/data/projects";
import { formatDate } from "@/lib/format";
import type { ProjectAccess } from "@/lib/project-access";
import { positionLabel, SLOTS_MAX, type Position } from "@/lib/project-rules";
import {
  cancelSlotRequest,
  makeLeader,
  removeMember,
  revokeInvite,
  setPosition,
} from "../../team-actions";
import {
  AddMemberForm,
  InviteForm,
  RatingForm,
  RoleEditForm,
  SetSlotsForm,
  SlotRequestForm,
} from "./team-forms";

export const metadata: Metadata = {
  title: "Project team",
  robots: { index: false, follow: false },
};

// The team can see this page. Leader and admins get every control; co-leaders
// run the members; everyone else on the team reads.
export default function ProjectTeamPage({ params }: PageProps<"/workspace/projects/[slug]/team">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <TeamView params={params} />
    </Suspense>
  );
}

/** Co-leaders act on plain members; leader and admins on anyone. */
function canTouch(access: ProjectAccess, m: TeamMemberRow) {
  return m.position === "member" ? access.canRunTeam : access.canManage;
}

function PositionBadge({ position }: { position: Position }) {
  if (position === "member") return null;
  return (
    <span className="text-accent-strong tracking-caps ml-2 text-xs uppercase">
      {positionLabel[position]}
    </span>
  );
}

async function TeamView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await getProjectDetail(slug);
  if (detail.kind === "missing") notFound();
  if (detail.kind === "restricted") return <RestrictedProject {...detail} />;

  const { access, programme, team, invites, slots, slotRequest, lastDecision } = detail;
  const run = access.canRunTeam;
  const manage = access.canManage;
  const candidates = run ? await getAddableMembers(access) : [];
  const positions: Position[] = manage ? ["member", "co_leader", "leader"] : ["member"];
  const full = slots.free < 1;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow={`Programme ${programme.number} · team`} title={programme.title}>
        {manage
          ? "Add people, give everyone a role, choose co-leaders and rate each person's work (1–5)."
          : run
            ? "As co-leader you can add and remove members, set their roles and invite people."
            : "Who is working on this project. The leader and co-leaders run the team."}
      </PageHeader>

      <section aria-labelledby="members" className="py-10">
        <SectionHeading number="01" id="members">
          Members
        </SectionHeading>
        <p className="text-muted mt-2 text-sm">
          {slots.used} of {slots.slots} slots in use
          {slots.invites > 0
            ? ` (${slots.members} on the team, ${slots.invites} open ${slots.invites === 1 ? "invite" : "invites"})`
            : ""}
          .
        </p>
        <ul className="border-line divide-line mt-6 divide-y border-y">
          {team.map((m) => {
            const touch = canTouch(access, m);
            const self = m.userId === access.user.id;
            return (
              <li key={m.membershipId} className={run ? "flex flex-col gap-3 py-5" : "py-4"}>
                <div className="min-w-0">
                  <p className="font-medium">
                    {m.name}
                    <PositionBadge position={m.position} />
                    {self ? <span className="text-muted ml-2 text-sm">(you)</span> : null}
                  </p>
                  <p className="text-sm">{m.role}</p>
                  <p className="text-muted text-sm break-all">
                    {m.email} · joined <time dateTime={m.joinedAt}>{formatDate(m.joinedAt)}</time>
                  </p>
                  <p className="mt-2">
                    <Stars value={m.rating} size="sm" />
                  </p>
                </div>
                {run && (touch || manage) ? (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {touch ? (
                      <RoleEditForm membershipId={m.membershipId} name={m.name} role={m.role} />
                    ) : null}
                    {manage && !self ? (
                      <RatingForm membershipId={m.membershipId} name={m.name} rating={m.rating} />
                    ) : null}
                    {manage && m.position !== "leader" ? (
                      <>
                        <form action={setPosition}>
                          <input type="hidden" name="membershipId" value={m.membershipId} />
                          <input
                            type="hidden"
                            name="position"
                            value={m.position === "co_leader" ? "member" : "co_leader"}
                          />
                          <button type="submit" className={ui.ghostSm}>
                            {m.position === "co_leader" ? "Remove co-leader" : "Make co-leader"}
                            <span className="sr-only"> ({m.name})</span>
                          </button>
                        </form>
                        <form action={makeLeader}>
                          <input type="hidden" name="membershipId" value={m.membershipId} />
                          <button type="submit" className={ui.ghostSm}>
                            Make leader<span className="sr-only"> ({m.name})</span>
                          </button>
                        </form>
                      </>
                    ) : null}
                    {touch && m.position !== "leader" ? (
                      <form action={removeMember}>
                        <input type="hidden" name="membershipId" value={m.membershipId} />
                        <button type="submit" className={ui.ghostSm}>
                          Remove<span className="sr-only"> {m.name}</span>
                        </button>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {run ? (
        <>
          <section aria-labelledby="add" className="border-line border-t py-10">
            <SectionHeading number="02" id="add">
              Add a member
            </SectionHeading>
            <div className="mt-6">
              {full ? (
                <p className="text-muted text-sm">
                  All {slots.slots} slots are in use. Remove someone, revoke an open invite or get
                  more slots below.
                </p>
              ) : (
                <AddMemberForm
                  projectId={access.projectId}
                  candidates={candidates}
                  positions={positions}
                />
              )}
            </div>
          </section>

          <section aria-labelledby="invite" className="border-line border-t py-10">
            <SectionHeading number="03" id="invite">
              Invite someone new
            </SectionHeading>
            <p className="text-muted mt-3 max-w-3xl leading-relaxed">
              For people who are not members yet. Accepting the link makes them a CAVALRY member and
              puts them on this project with the role and position you set.
            </p>
            <div className="mt-6">
              <InviteForm projectId={access.projectId} positions={positions} full={full} />
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
                        {i.position !== "member" ? (
                          <span className="text-accent-strong"> · {positionLabel[i.position]}</span>
                        ) : null}
                        {i.note ? <span className="text-muted"> · {i.note}</span> : null}
                        <span className="text-muted">
                          {" "}
                          · expires <time dateTime={i.expiresAt}>{formatDate(i.expiresAt)}</time>
                        </span>
                      </p>
                      {i.position === "member" || manage ? (
                        <form action={revokeInvite}>
                          <input type="hidden" name="inviteId" value={i.id} />
                          <button type="submit" className={ui.ghostSm}>
                            Revoke<span className="sr-only"> invite for {i.role}</span>
                          </button>
                        </form>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          <section aria-labelledby="slots" className="border-line border-t py-10">
            <SectionHeading number="04" id="slots">
              Slots
            </SectionHeading>
            <p className="text-muted mt-3 max-w-3xl leading-relaxed">
              Projects start with 5 slots and can have up to {SLOTS_MAX}. Everyone on the team and
              every open invite uses one. Only the leader can ask an admin for more.
            </p>
            <div className="mt-6 space-y-6">
              {slotRequest ? (
                <div className="border-accent border-l-2 pl-3">
                  <p className="text-sm">
                    <span className="font-medium">
                      Waiting for an admin: {slotRequest.extra} more{" "}
                      {slotRequest.extra === 1 ? "slot" : "slots"}
                    </span>{" "}
                    <span className="text-muted">
                      · asked{" "}
                      <time dateTime={slotRequest.createdAt}>
                        {formatDate(slotRequest.createdAt)}
                      </time>
                    </span>
                  </p>
                  <p className="text-muted text-sm">{slotRequest.reason}</p>
                  {access.canRequestSlots ? (
                    <form action={cancelSlotRequest} className="mt-2">
                      <input type="hidden" name="requestId" value={slotRequest.id} />
                      <button type="submit" className={ui.ghostSm}>
                        Withdraw request
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : access.canRequestSlots && slots.slots < SLOTS_MAX ? (
                <SlotRequestForm projectId={access.projectId} room={SLOTS_MAX - slots.slots} />
              ) : access.canRequestSlots ? (
                <p className="text-muted text-sm">This project has the most slots ({SLOTS_MAX}).</p>
              ) : !access.isAdmin ? (
                <p className="text-muted text-sm">Ask the leader if the team needs more slots.</p>
              ) : null}

              {lastDecision && !slotRequest ? (
                <p className="text-muted text-sm">
                  Last request ({lastDecision.extra} more):{" "}
                  <span className="text-ink font-medium">
                    {lastDecision.status === "approved" ? "approved" : "declined"}
                  </span>
                  {lastDecision.decidedAt ? (
                    <>
                      {" "}
                      on{" "}
                      <time dateTime={lastDecision.decidedAt}>
                        {formatDate(lastDecision.decidedAt)}
                      </time>
                    </>
                  ) : null}
                  {lastDecision.adminNote ? `: ${lastDecision.adminNote}` : ""}
                </p>
              ) : null}

              {access.isAdmin ? (
                <div className="border-line border-t pt-6">
                  <SetSlotsForm
                    projectId={access.projectId}
                    slots={slots.slots}
                    min={Math.max(1, slots.used)}
                    max={SLOTS_MAX}
                  />
                  {slotRequest ? (
                    <p className="mt-3 text-sm">
                      <Link href="/admin/slot-requests" className={ui.link}>
                        Review the request in Admin →
                      </Link>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
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
