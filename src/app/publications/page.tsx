import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SectionHeading } from "@/components/page-header";
import { outputKinds, outputs, type Output } from "@/content/publications";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Papers, datasets, code and briefs from CAVALRY research, with the honest status of each.",
};

function OutputRow({ output: o }: { output: Output }) {
  return (
    <li className="grid gap-3 py-5 md:grid-cols-12 md:gap-6">
      <div className="flex flex-wrap items-start gap-2 md:col-span-3 md:flex-col">
        <span className="border-line border px-2 py-0.5 text-xs">{o.type}</span>
        <span className="text-accent-strong tracking-caps text-xs uppercase">{o.status}</span>
      </div>
      <div className="md:col-span-9">
        <h3 className="text-xl leading-snug">{o.title}</h3>
        <p className="text-muted mt-1 text-sm">{o.authors}</p>
        <p className="mt-2 leading-relaxed">{o.abstract}</p>
        {o.programmeSlug ? (
          <Link
            href={`/research/${o.programmeSlug}`}
            className="text-primary hover:text-accent tracking-caps mt-3 inline-block text-xs uppercase transition-colors"
          >
            About the programme →
          </Link>
        ) : null}
      </div>
    </li>
  );
}

export default function PublicationsPage() {
  const published = outputs.filter((o) => o.status === "Published");
  const upcoming = outputs.filter((o) => o.status !== "Published");

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
              We are a new group and our first programme is at its protocol stage. Our first outputs
              are listed below with their real status. We would rather show an empty list than an
              inflated one.
            </p>
          </div>
        ) : (
          <ul className="border-line mt-6 divide-y border-y">
            {published.map((o) => (
              <OutputRow key={o.slug} output={o} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="upcoming" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="02" id="upcoming">
          In preparation
        </SectionHeading>
        <ul className="border-line mt-6 divide-y border-y">
          {upcoming.map((o) => (
            <OutputRow key={o.slug} output={o} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="kinds" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="03" id="kinds">
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
