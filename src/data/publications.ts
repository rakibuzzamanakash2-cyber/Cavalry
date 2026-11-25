import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Output, OutputStatus, OutputType } from "@/content/publications";
import type {
  OutputStatus as DbOutputStatus,
  OutputType as DbOutputType,
} from "@/generated/prisma/enums";
import { getDb } from "@/lib/db";
import { requireMember } from "@/lib/session";

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

async function listOutputs(scope: "public" | "all"): Promise<Output[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("publications");
  const rows = await getDb().publication.findMany({
    where: scope === "public" ? { status: "published" } : undefined,
    include: { project: { select: { slug: true, status: true } } },
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
    // Link only to programmes that are public themselves.
    programmeSlug:
      r.project && (scope === "all" || r.project.status === "completed")
        ? r.project.slug
        : undefined,
    links: [
      r.url ? { label: "Read", href: r.url } : null,
      r.pdfUrl ? { label: "PDF", href: r.pdfUrl } : null,
      r.doi ? { label: "DOI", href: `https://doi.org/${r.doi}` } : null,
    ].filter((l): l is { label: string; href: string } => l !== null),
  }));
}

/** Published outputs, for everyone. */
export function getPublicOutputs() {
  return listOutputs("public");
}

/** All outputs, including work in preparation. Members only. */
export async function getWorkspaceOutputs(): Promise<Output[]> {
  await requireMember("/workspace");
  return listOutputs("all");
}
