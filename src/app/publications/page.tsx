import type { Metadata } from "next";
import Link from "next/link";
import { Byline } from "@/components/byline";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { outputKinds, type Output } from "@/content/publications";
import { getPublicOutputs } from "@/data/publications";
import { getPeople } from "@/data/team";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Papers, datasets, code and briefs from CAVALRY research, with the honest status of each.",
};

function OutputRow({
  output: o,
  people,
}: {
  output: Output;
  people: { name: string; slug: string }[];
}) {
  return (
    <li className="grid gap-3 py-5 md:grid-cols-12 md:gap-6">
      <div className="flex flex-wrap items-start gap-2 md:col-span-3 md:flex-col">
        <span className="border-line border px-2 py-0.5 text-xs">{o.type}</span>
        <span className="text-accent-strong tracking-caps text-xs uppercase">{o.status}</span>
      </div>
      <div className="md:col-span-9">
        <h3 className="text-xl leading-snug">
          {o.status === "Published" ? (
            <Link
              href={`/publications/${o.slug}`}
              className="hover:text-accent-strong transition-colors"
            >
              {o.title}
            </Link>
          ) : (
            o.title
          )}
        </h3>
        <p className="text-muted mt-1 text-sm">
          <Byline authors={o.authors} people={people} />
          {o.year ? ` · ${o.year}` : ""}
          {o.venue ? ` · ${o.venue}` : ""}
        </p>
        <p className="mt-2 leading-relaxed">{o.abstract}</p>
        {(o.links?.length ?? 0) > 0 || o.programmeSlug ? (
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {(o.links ?? []).map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-accent text-sm font-medium transition-colors"
              >
                {l.label}
                <span className="sr-only">: {o.title} (opens in a new tab)</span>{" "}
                <span aria-hidden>↗</span>
              </a>
            ))}
            {o.programmeSlug ? (
              <Link
                href={`/research/${o.programmeSlug}`}
                className="text-primary hover:text-accent tracking-caps text-xs uppercase transition-colors"
              >
                About the programme →
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export default async function PublicationsPage() {
  const [published, people] = await Promise.all([getPublicOutputs(), getPeople()]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Publications" title="Papers, data and code">
        Everything we publish comes with the code and documentation needed to check it.
      </PageHeader>

      <section aria-labelledby="published" className="py-10 sm:py-14">
        <SectionHeading number="01" id="published">
          Published
        </SectionHeading>
        {published.length === 0 ? (
          <div className="border-line bg-sand/40 mt-6 border p-5 sm:p-6">
            <p className="font-serif text-xl">Nothing published yet.</p>
            <p className="text-muted mt-2 max-w-2xl leading-relaxed">
              We are a new group and our research is still in progress. Papers, data and code appear
              here when they are published. We would rather show an empty list than an inflated one.
            </p>
          </div>
        ) : (
          <ul className="border-line divide-line mt-6 divide-y border-y">
            {published.map((o) => (
              <OutputRow key={o.slug} output={o} people={people} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="kinds" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="02" id="kinds">
          What you will find here
        </SectionHeading>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {outputKinds.map((k) => (
            <li key={k.title} className="border-line border-t-2 pt-3">
              <h3 className="text-xl">{k.title}</h3>
              <p className="text-muted mt-1 leading-relaxed">{k.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
