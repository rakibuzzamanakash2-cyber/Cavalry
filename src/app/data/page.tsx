import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/components/ui";
import { getPublicDatasets } from "@/data/catalogue";
import { licenceOf } from "@/lib/citation";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Data",
  description:
    "Datasets published by CAVALRY research, with their sources, coverage, licence and how to cite them.",
};

export default async function DataPage() {
  const datasets = await getPublicDatasets();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Data" title="Data catalogue">
        Datasets we have built and checked, shared so others can reuse them and verify our work.
        Each one lists its source, its licence and how to cite it.
      </PageHeader>
      {datasets.length === 0 ? (
        <div className="py-10 sm:py-14">
          <p className="text-muted max-w-2xl leading-relaxed">
            No datasets are public yet. Data from research in progress stays confidential; it is
            published here, with documentation, once the work is finished.
          </p>
          <p className="mt-4">
            <Link href="/how-we-work" className={ui.link}>
              How we handle data →
            </Link>
          </p>
        </div>
      ) : (
        <ul
          className="border-line divide-line mt-10 divide-y border-y"
          data-testid="public-datasets"
        >
          {datasets.map((d) => (
            <li key={d.slug} className="grid gap-2 py-6 md:grid-cols-12 md:gap-6">
              <p className="text-muted text-sm md:col-span-3">
                <time dateTime={d.publishedAt}>{formatDate(d.publishedAt)}</time>
                <br />
                {licenceOf(d.licence)?.name ?? "Licence not stated"}
              </p>
              <div className="md:col-span-9">
                <h2 className="text-2xl leading-snug">
                  <Link
                    href={`/data/${d.slug}`}
                    className="hover:text-accent-strong transition-colors"
                  >
                    {d.name}
                  </Link>
                </h2>
                <p className="text-muted mt-2 leading-relaxed">{d.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
