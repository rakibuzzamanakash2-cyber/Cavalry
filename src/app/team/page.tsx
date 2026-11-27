import type { Metadata } from "next";
import Link from "next/link";
import { JoinLink } from "@/components/join-link";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { PersonAvatar } from "@/components/person-avatar";
import { joiningNotes, type Person } from "@/content/team";
import { getOpenRoles, getPeople } from "@/data/team";

export const metadata: Metadata = {
  title: "Team",
  description:
    "The founding team of CAVALRY research and the open member roles for the first programme.",
};

function PersonCard({ person }: { person: Person }) {
  return (
    <article className="border-line bg-surface flex h-full flex-col gap-4 border p-5 shadow-[6px_6px_0_0_var(--color-sand)] sm:flex-row sm:p-6">
      <PersonAvatar name={person.name} photo={person.photo} />
      <div>
        <h3 className="text-2xl leading-tight">
          <Link
            href={`/team/${person.slug}`}
            className="hover:text-accent-strong transition-colors"
          >
            {person.name}
          </Link>
        </h3>
        <p className="text-accent-strong tracking-caps mt-1 text-xs uppercase">{person.role}</p>
        <p className="mt-3 leading-relaxed">{person.bio}</p>
        <p className="text-muted mt-3 text-sm">
          <span className="text-ink font-medium">Focus: </span>
          {person.focus}
        </p>
        {person.links?.length || person.email ? (
          <ul className="tracking-caps mt-3 flex flex-wrap gap-4 text-xs uppercase">
            {person.email ? (
              <li>
                <a
                  href={`mailto:${person.email}`}
                  className="text-primary hover:text-accent transition-colors"
                >
                  Email<span className="sr-only"> {person.name}</span>
                </a>
              </li>
            ) : null}
            {(person.links ?? []).map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-accent transition-colors"
                >
                  {l.label}
                  <span className="sr-only">: {person.name} (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export default async function TeamPage() {
  const [people, openRoles] = await Promise.all([getPeople(), getOpenRoles()]);
  const founders = people.filter((p) => p.isFounder);
  const members = people.filter((p) => !p.isFounder);
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Team" title="A small team, by design">
        Two founders with complementary strengths, growing carefully with members who want to do
        rigorous work.
      </PageHeader>

      <section aria-labelledby="founders" className="py-10 sm:py-14">
        <SectionHeading number="01" id="founders">
          Founders
        </SectionHeading>
        <ul className="mt-6 grid gap-6 lg:grid-cols-2">
          {founders.map((p) => (
            <li key={p.slug}>
              <PersonCard person={p} />
            </li>
          ))}
        </ul>
      </section>

      {members.length > 0 ? (
        <section aria-labelledby="members" className="border-line border-t py-10 sm:py-14">
          <SectionHeading number="02" id="members">
            Members
          </SectionHeading>
          <ul className="mt-6 grid gap-6 lg:grid-cols-2">
            {members.map((p) => (
              <li key={p.slug}>
                <PersonCard person={p} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="join" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number={members.length > 0 ? "03" : "02"} id="join">
          Join the first programme
        </SectionHeading>
        <p className="text-muted mt-3 max-w-3xl leading-relaxed">
          We are looking for members in three fields for our first research programme.
        </p>
        <ul className="border-line mt-6 grid border-t border-l md:grid-cols-3">
          {openRoles.map((r) => (
            <li key={r.slug} className="border-line border-r border-b p-5 sm:p-6">
              <p className="text-accent-strong tracking-caps text-xs uppercase">Open role</p>
              <h3 className="mt-2 text-xl leading-snug">{r.title}</h3>
              <p className="text-muted mt-3 text-sm leading-relaxed">
                <span className="text-ink font-medium">Background: </span>
                {r.background}
              </p>
              <p className="text-muted mt-2 text-sm leading-relaxed">
                <span className="text-ink font-medium">You would own: </span>
                {r.owns}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-8 grid gap-6 md:grid-cols-12">
          <ul className="space-y-2 md:col-span-8">
            {joiningNotes.map((n) => (
              <li key={n} className="flex gap-3 leading-relaxed">
                <span
                  className="text-accent mt-2.5 size-1.5 shrink-0 rotate-45 bg-current"
                  aria-hidden
                />
                {n}
              </li>
            ))}
          </ul>
          <div className="md:col-span-4 md:text-right">
            <JoinLink
              className="bg-primary text-primary-foreground hover:bg-accent inline-block w-full px-5 py-3 text-center text-sm font-medium transition-colors md:w-auto"
              memberLabel={null}
            >
              Apply to join
            </JoinLink>
          </div>
        </div>
      </section>
    </div>
  );
}
