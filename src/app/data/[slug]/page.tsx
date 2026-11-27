import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/article-skeleton";
import { CiteThis } from "@/components/cite-this";
import { ui } from "@/components/ui";
import { getPublicDataset, type PublicDataset } from "@/data/catalogue";
import { formatReference, licenceOf, toBibtex, toRis, type Citable } from "@/lib/citation";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";

// One page per published dataset (ADR 0018).

function citable(d: PublicDataset): Citable {
  return {
    slug: d.slug,
    title: d.name,
    type: "Dataset",
    authors: site.name,
    year: d.year,
    pageUrl: `${site.url}/data/${d.slug}`,
    publisher: site.name,
  };
}

export async function generateMetadata({ params }: PageProps<"/data/[slug]">): Promise<Metadata> {
  const d = await getPublicDataset((await params).slug);
  if (!d) return {};
  return {
    title: d.name,
    description: d.description.slice(0, 200),
    alternates: { canonical: `/data/${d.slug}` },
  };
}

export default function DatasetPage({ params }: PageProps<"/data/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton narrow />}>
      <DatasetContent params={params} />
    </Suspense>
  );
}

async function DatasetContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await getPublicDataset(slug);
  if (!d) notFound();
  const licence = licenceOf(d.licence);
  const work = citable(d);

  // schema.org Dataset, read by Google Dataset Search.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: d.name,
    description: d.description,
    url: work.pageUrl,
    datePublished: d.publishedAt,
    license: licence?.url ?? undefined,
    creator: { "@type": "ResearchOrganization", name: site.name, url: site.url },
    distribution: [{ "@type": "DataDownload", contentUrl: d.url }],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="pt-8 text-sm sm:pt-12">
        <Link href="/data" className={ui.link}>
          Data
        </Link>
      </nav>
      <header className="border-line border-b pt-4 pb-8 sm:pb-10">
        <p className="text-accent-strong tracking-caps text-xs uppercase">
          Dataset · published <time dateTime={d.publishedAt}>{formatDate(d.publishedAt)}</time>
        </p>
        <h1 className="mt-3 max-w-4xl text-3xl leading-[1.15] sm:text-4xl">{d.name}</h1>
      </header>

      <div className="grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 space-y-8 lg:col-span-7">
          <section aria-labelledby="about">
            <h2 id="about" className="text-2xl">
              About the data
            </h2>
            <p className="prose-measure mt-3 text-lg leading-relaxed">{d.description}</p>
          </section>
          <section aria-labelledby="use">
            <h2 id="use" className="text-2xl">
              How we use it
            </h2>
            <p className="prose-measure mt-3 text-lg leading-relaxed">{d.usedFor}</p>
          </section>
          {d.programme ? (
            <p>
              <Link href={`/research/${d.programme.slug}`} className={ui.link}>
                Built for: {d.programme.title} →
              </Link>
            </p>
          ) : null}
        </div>

        <aside className="space-y-8 lg:col-span-5">
          <div>
            <h2 className={ui.label}>Get the data</h2>
            <p className="mt-3">
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${ui.button} inline-block`}
              >
                Download or view the data
                <span className="sr-only"> (opens in a new tab)</span> <span aria-hidden>↗</span>
              </a>
            </p>
          </div>
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
                <span className="text-muted">Not stated. Ask us before reusing this data.</span>
              )}
            </p>
          </div>
          <CiteThis
            fileName={d.slug}
            reference={formatReference(work)}
            bibtex={toBibtex(work)}
            ris={toRis(work)}
          />
        </aside>
      </div>
    </div>
  );
}
