import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Byline } from "@/components/byline";
import { SectionHeading } from "@/components/page-header";
import { PersonAvatar } from "@/components/person-avatar";
import { ui } from "@/components/ui";
import { getPublicOutputs } from "@/data/publications";
import { getPeople, getPerson } from "@/data/team";
import { isAuthor } from "@/lib/authors";
import { site } from "@/lib/site";

// Public profile pages, linked from the team page and from author names.

export async function generateStaticParams() {
  return (await getPeople()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/team/[slug]">): Promise<Metadata> {
  const person = await getPerson((await params).slug);
  if (!person) return {};
  return { title: person.name, description: `${person.role}. ${person.focus}` };
}

export default async function PersonPage({ params }: PageProps<"/team/[slug]">) {
  const { slug } = await params;
  const [person, people, outputs] = await Promise.all([
    getPerson(slug),
    getPeople(),
    getPublicOutputs(),
  ]);
  if (!person) notFound();
  const theirs = outputs.filter((o) => isAuthor(o.authors, person.name));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.role,
    worksFor: { "@type": "ResearchOrganization", name: site.name, url: site.url },
    sameAs: (person.links ?? []).map((l) => l.href),
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="pt-8 text-sm sm:pt-12">
        <Link href="/team" className={ui.link}>
          Team
        </Link>
      </nav>
      <header className="border-line flex flex-col gap-6 border-b pt-4 pb-8 sm:flex-row sm:items-end sm:pb-10">
        <PersonAvatar name={person.name} photo={person.photo} size="lg" />
        <div>
          <p className="text-accent-strong tracking-caps text-xs uppercase">
            {person.isFounder ? "Co-founder" : "Member"}
          </p>
          <h1 className="mt-2 text-4xl leading-[1.1] sm:text-5xl">{person.name}</h1>
          <p className="text-muted mt-2 text-lg">{person.role}</p>
        </div>
      </header>

      <div className="grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12">
        <div className="prose-measure text-lg leading-relaxed lg:col-span-8">
          <p>{person.bio}</p>
        </div>
        <aside className="space-y-6 lg:col-span-4">
          <div>
            <h2 className={ui.label}>Focus</h2>
            <p className="mt-2 leading-relaxed">{person.focus}</p>
          </div>
          {person.email || (person.links?.length ?? 0) > 0 ? (
            <div>
              <h2 className={ui.label}>Contact and profiles</h2>
              <ul className="mt-2 space-y-1.5">
                {person.email ? (
                  <li>
                    <a href={`mailto:${person.email}`} className={ui.link}>
                      {person.email}
                    </a>
                  </li>
                ) : null}
                {(person.links ?? []).map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className={ui.link}>
                      {l.label}
                      <span className="sr-only"> (opens in a new tab)</span>{" "}
                      <span aria-hidden>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      <section aria-labelledby="work" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="01" id="work">
          Publications
        </SectionHeading>
        {theirs.length === 0 ? (
          <p className="text-muted mt-4 max-w-2xl leading-relaxed">
            No published work yet. Our research stays confidential until it is finished; papers,
            datasets and code will appear here when they are published.
          </p>
        ) : (
          <ul className="border-line divide-line mt-6 divide-y border-y">
            {theirs.map((o) => (
              <li key={o.slug} className="py-5">
                <p className="text-muted tracking-caps text-xs uppercase">
                  {o.type}
                  {o.year ? ` · ${o.year}` : ""}
                </p>
                <h3 className="mt-1 text-lg leading-snug">
                  <Link
                    href={`/publications/${o.slug}`}
                    className="hover:text-accent-strong transition-colors"
                  >
                    {o.title}
                  </Link>
                </h3>
                <p className="text-muted mt-1 text-sm">
                  <Byline authors={o.authors} people={people} />
                  {o.venue ? ` · ${o.venue}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
