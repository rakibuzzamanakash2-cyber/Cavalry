import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  outputs as contentOutputs,
  type Output,
  type OutputStatus,
  type OutputType,
} from "@/content/publications";
import type {
  OutputStatus as DbOutputStatus,
  OutputType as DbOutputType,
} from "@/generated/prisma/enums";
import { getDb } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";

// Database enums ↔ the labels shown on the site.
export const outputTypeLabel: Record<DbOutputType, OutputType> = {
  working_paper: "Working paper",
  journal_article: "Journal article",
  preprint: "Preprint",
  dataset: "Dataset",
  software: "Software",
  policy_brief: "Policy brief",
};

export const outputStatusLabel: Record<DbOutputStatus, OutputStatus> = {
  in_preparation: "In preparation",
  under_review: "Under review",
  published: "Published",
};

export async function getOutputs(): Promise<Output[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("publications");
  if (!isDatabaseConfigured()) return contentOutputs;
  const rows = await getDb().publication.findMany({
    include: { project: { select: { slug: true } } },
    orderBy: [{ year: { sort: "desc", nulls: "first" } }, { sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    type: outputTypeLabel[r.type],
    status: outputStatusLabel[r.status],
    authors: r.authors,
    year: r.year ?? undefined,
    venue: r.venue ?? undefined,
    abstract: r.abstract,
    programmeSlug: r.project?.slug,
    links: [
      r.url ? { label: "Read", href: r.url } : null,
      r.pdfUrl ? { label: "PDF", href: r.pdfUrl } : null,
      r.doi ? { label: "DOI", href: `https://doi.org/${r.doi}` } : null,
    ].filter((l): l is { label: string; href: string } => l !== null),
  }));
}
