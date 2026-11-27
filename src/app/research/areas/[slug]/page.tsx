import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Byline } from "@/components/byline";
import { SectionHeading } from "@/components/page-header";
import { ui } from "@/components/ui";
import { getResearchArea, researchAreas } from "@/content/research";
import { getPublicProgrammes } from "@/data/programmes";
import { getPublicOutputs } from "@/data/publications";
import { getPeople } from "@/data/team";
import { toneBg } from "@/lib/tones";

// Topic pages, one per research area (ADR 0016). The copy is general site
// content; only finished, public programmes and outputs are listed.

export function generateStaticParams() {
  return researchAreas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/research/areas/[slug]">): Promise<Metadata> {
  const area = getResearchArea((await params).slug);
  if (!area) return {};
  return { title: area.title, description: area.long };
}

export default async function ResearchAreaPage({ params }: PageProps<"/research/areas/[slug]">) {
  const area = getResearchArea((await params).slug);
  if (!area) notFound();

  const [programmes, outputs, people] = await Promise.all([
    getPublicProgrammes(),
    getPublicOutputs(),
    getPeople(),
  ]);
  const inArea = programmes.filter((p) => p.areas.includes(area.title));
  const slugs = new Set(inArea.map((p) => p.slug));
  const areaOutputs = outputs.filter((o) => o.programmeSlug && slugs.has(o.programmeSlug));
  const others = researchAreas.filter((a) => a.slug !== area.slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <nav aria-label="Breadcrumb" className="pt-8 text-sm sm:pt-12">
        <Link href="/research" className={ui.link}>
          Research
        </Link>
        <span className="text-muted"> / Research areas</span>
      </nav>
      <header className="border-line border-b pt-4 pb-8 sm:pb-10">
        <span aria-hidden className={`block h-1 w-14 ${toneBg[area.tone]}`} />
        <p className="text-accent-strong tracking-caps mt-5 text-xs uppercase">Research area</p>
        <h1 className="mt-3 max-w-4xl text-4xl leading-[1.1] sm:text-5xl">{area.title}</h1>
        <p className="text-muted mt-4 max-w-3xl font-serif text-lg leading-snug italic sm:text-xl">
          {area.long}
        </p>
      </header>

      <div className="grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12">
        <div className="prose-measure space-y-4 text-lg leading-relaxed lg:col-span-7">
          {area.intro.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <aside className="lg:col-span-5">
          <div className="border-line bg-sand/40 border p-5 sm:p-6">
            <h2 className="text-2xl">Questions we ask</h2>
            <ul className="mt-4 space-y-3">
              {area.questions.map((q) => (
                <li key={q} className="flex gap-3 leading-relaxed">
                  <span
                    aria-hidden
                    className={`mt-2.5 size-1.5 shrink-0 rotate-45 ${toneBg[area.tone]}`}
                  />
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section aria-labelledby="approach" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="01" id="approach">
          How we approach it
        </SectionHeading>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {area.methods.map((m, i) => (
            <li key={m} className="border-line border-t-2 pt-3">
              <p className="text-accent font-serif text-2xl leading-none">{i + 1}</p>
              <p className="mt-2 leading-relaxed">{m}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6">
          <Link href="/how-we-work" className={ui.link}>
            Our standards for every programme →
          </Link>
        </p>
      </section>

      <section aria-labelledby="work" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="02" id="work">
          Published work in this area
        </SectionHeading>
        {inArea.length === 0 ? (
          <p className="text-muted mt-4 max-w-2xl leading-relaxed">
            Nothing published yet. Research in progress stays confidential; finished programmes,
            papers and datasets in {area.title.toLowerCase()} will be listed here.
          </p>
        ) : (
          <ul className="border-line divide-line mt-6 divide-y border-y">
            {inArea.map((p) => (
              <li key={p.slug} className="py-5">
                <p className="text-accent-strong tracking-caps text-xs uppercase">{p.label}</p>
                <h3 className="mt-1 text-xl leading-snug">
                  <Link
                    href={`/research/${p.slug}`}
                    className="hover:text-accent transition-colors"
                  >
                    {p.title}
                  </Link>
                </h3>
                <p className="text-muted mt-2 leading-relaxed">{p.summary}</p>
              </li>
            ))}
            {areaOutputs.map((o) => (
              <li key={o.slug} className="py-5">
                <p className="text-muted tracking-caps text-xs uppercase">
                  {o.type}
                  {o.year ? ` · ${o.year}` : ""}
                </p>
                <h3 className="mt-1 text-lg leading-snug">{o.title}</h3>
                <p className="text-muted mt-1 text-sm">
                  <Byline authors={o.authors} people={people} />
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="other-areas" className="border-line border-t py-10 sm:py-14">
        <SectionHeading number="03" id="other-areas">
          Other research areas
        </SectionHeading>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {others.map((a) => (
            <li key={a.slug}>
              <span aria-hidden className={`block h-0.5 w-10 ${toneBg[a.tone]}`} />
              <h3 className="mt-3 text-lg">
                <Link
                  href={`/research/areas/${a.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  {a.title}
                </Link>
              </h3>
              <p className="text-muted mt-1 text-sm leading-relaxed">{a.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
