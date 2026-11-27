import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/lib/db";

// The public data catalogue (/data). Only datasets an admin has published, and
// only while their project (if any) is completed: research in progress stays
// confidential (ADR 0018).

export type PublicDataset = {
  slug: string;
  name: string;
  description: string;
  usedFor: string;
  url: string;
  licence?: string;
  year?: number;
  publishedAt: string;
  programme?: { slug: string; title: string };
};

async function listPublicDatasets(): Promise<PublicDataset[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("datasets-public");
  const rows = await getDb().dataset.findMany({
    where: {
      isPublic: true,
      slug: { not: null },
      OR: [{ projectId: null }, { project: { status: "completed" } }],
    },
    include: { project: { select: { slug: true, title: true } } },
    orderBy: [{ publishedAt: "desc" }, { name: "asc" }],
  });
  return rows.map((d) => ({
    slug: d.slug!,
    name: d.name,
    description: d.description,
    usedFor: d.usedFor,
    url: d.url,
    licence: d.licence ?? undefined,
    year: d.publishedAt?.getUTCFullYear(),
    publishedAt: (d.publishedAt ?? d.updatedAt).toISOString().slice(0, 10),
    programme: d.project ? { slug: d.project.slug, title: d.project.title } : undefined,
  }));
}

export function getPublicDatasets() {
  return listPublicDatasets();
}

export async function getPublicDataset(slug: string) {
  return (await listPublicDatasets()).find((d) => d.slug === slug);
}
