import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { Byline } from "@/components/byline";
import { CiteThis } from "@/components/cite-this";
import { ui } from "@/components/ui";
import type { Output } from "@/content/publications";
import { getPublicOutput } from "@/data/publications";
import { getPeople } from "@/data/team";
import {
  authorList,
  formatReference,
  licenceOf,
  toBibtex,
  toRis,
  type Citable,
} from "@/lib/citation";
import { site } from "@/lib/site";

// One page per published output, with citation data for reference managers
// and Google Scholar (ADR 0017). Only published work is ever found here.

function citable(o: Output): Citable {
  return {
    slug: o.slug,
    title: o.title,
    type: o.type,
    authors: o.authors,
    year: o.year,
    venue: o.venue,
    doi: o.doi,
    pageUrl: `${site.url}/publications/${o.slug}`,
    publisher: site.name,
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/publications/[slug]">): Promise<Metadata> {
  const o = await getPublicOutput((await params).slug);
  if (!o) return {};
  // Highwire tags read by Google Scholar and reference managers.
  const other: Record<string, string | string[]> = {
    citation_title: o.title,
    citation_author: authorList(o.authors),
  };
  if (o.year) other.citation_publication_date = String(o.year);
  if (o.doi) other.citation_doi = o.doi;
  if (o.pdfUrl) other.citation_pdf_url = o.pdfUrl;
  if (o.type === "Journal article" && o.venue) other.citation_journal_title = o.venue;
  else if (o.type === "Working paper" || o.type === "Policy brief")
    other.citation_technical_report_institution = site.name;
  return {
    title: o.title,
    description: o.abstract.slice(0, 200),
    alternates: { canonical: `/publications/${o.slug}` },
    openGraph: { type: "article", title: o.title, description: o.abstract.slice(0, 200) },
    other,
  };
}

export default function PublicationPage({ params }: PageProps<"/publications/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton narrow />}>
      <PublicationContent params={params} />
    </Suspense>
  );
}

async function PublicationContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [o, people] = await Promise.all([getPublicOutput(slug), getPeople()]);
  if (!o) notFound();

  const work = citable(o);
  const licence = licenceOf(o.licence);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type":
      o.type === "Dataset"
        ? "Dataset"
        : o.type === "Software"
          ? "SoftwareSourceCode"
          : "ScholarlyArticle",
    name: o.title,
    headline: o.title,
    author: authorList(o.authors).map((name) => ({ "@type": "Person", name })),
    datePublished: o.year ? String(o.year) : undefined,
    abstract: o.abstract,
    publisher: { "@type": "ResearchOrganization", name: site.name, url: site.url },
    identifier: o.doi ? `https://doi.org/${o.doi}` : undefined,
    license: licence?.url ?? undefined,
    url: work.pageUrl,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="pt-8 text-sm sm:pt-12">
        <Link href="/publications" className={ui.link}>
          Publications
        </Link>
      </nav>
      <header className="border-line border-b pt-4 pb-8 sm:pb-10">
        <p className="text-accent-strong tracking-caps text-xs uppercase">
          {o.type}
          {o.year ? ` · ${o.year}` : ""}
        </p>
        <h1 className="mt-3 max-w-4xl text-3xl leading-[1.15] sm:text-4xl">{o.title}</h1>
        <p className="text-muted mt-4 text-lg">
          <Byline authors={o.authors} people={people} />
        </p>
        {o.venue ? <p className="text-muted mt-1 italic">{o.venue}</p> : null}
      </header>

      <div className="grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-7">
          <h2 className="text-2xl">Abstract</h2>
          <div className="prose-measure mt-4 space-y-4 text-lg leading-relaxed">
            {o.abstract.split(/\n\s*\n/).map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
          {o.programmeSlug ? (
            <p className="mt-8">
              <Link href={`/research/${o.programmeSlug}`} className={ui.link}>
                Read about the programme behind this work →
              </Link>
            </p>
          ) : null}
        </div>

        <aside className="space-y-8 lg:col-span-5">
          {(o.links?.length ?? 0) > 0 ? (
            <div>
              <h2 className={ui.label}>Read and reuse</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {o.links!.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-primary text-primary hover:bg-sand inline-block border px-3 py-1.5 text-sm font-medium transition-colors"
                    >
                      {l.label}
                      <span className="sr-only"> (opens in a new tab)</span>{" "}
                      <span aria-hidden>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <h2 className={ui.label}>Licence</h2>
            <p className="mt-2" data-testid="licence">
              {licence ? (
                licence.url ? (
                  <a
                    href={licence.url}
                    target="_blank"
                    rel="noopener noreferrer license"
                    className={ui.link}
                  >
                    {licence.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  licence.name
                )
              ) : (
                <span className="text-muted">Not stated. Ask us before reusing this work.</span>
              )}
            </p>
          </div>
          <CiteThis
            fileName={slug}
            reference={formatReference(work)}
            bibtex={toBibtex(work)}
            ris={toRis(work)}
          />
        </aside>
      </div>
    </div>
  );
}
