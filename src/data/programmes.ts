import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import type { Programme } from "@/content/research";
import type { Project } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { requireMember } from "@/lib/session";

// JSON columns are validated on read, so a bad row fails loudly instead of
// rendering a broken page.
const termValue = z.array(z.object({ term: z.string(), value: z.string() }));
const json = {
  whyItMatters: z.array(z.string()),
  subQuestions: z.array(z.object({ id: z.string(), question: z.string(), hypothesis: z.string() })),
  design: termValue,
  dataSources: z.array(z.object({ need: z.string(), source: z.string(), role: z.string() })),
  approach: z.array(z.object({ title: z.string(), detail: z.string() })),
  scopes: z.array(z.object({ plan: z.string(), scope: z.string(), why: z.string() })),
  stages: z.array(z.object({ name: z.string(), detail: z.string() })),
  outputs: z.array(z.string()),
  commitments: z.array(z.string()),
  highlights: termValue,
};

function toProgramme(row: Project): Programme {
  return {
    slug: row.slug,
    number: row.number,
    label: row.label,
    title: row.title,
    status: row.statusLabel,
    lastUpdated: row.lastUpdated.toISOString().slice(0, 10),
    leads: row.leads,
    areas: row.areas,
    summary: row.summary,
    question: row.question,
    whyItMatters: json.whyItMatters.parse(row.whyItMatters),
    subQuestions: json.subQuestions.parse(row.subQuestions),
    design: json.design.parse(row.design),
    dataSources: json.dataSources.parse(row.dataSources),
    approach: json.approach.parse(row.approach),
    scopes: json.scopes.parse(row.scopes),
    stages: json.stages.parse(row.stages),
    currentStage: row.currentStage,
    outputs: json.outputs.parse(row.outputs),
    commitments: json.commitments.parse(row.commitments),
    highlights: json.highlights.parse(row.highlights),
    isFeatured: row.isFeatured,
  };
}

// Cached readers are NOT exported: callers go through the getters below, which
// decide who may see what (public = completed work only; workspace = members).

async function listProgrammes(scope: "public" | "all"): Promise<Programme[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  const rows = await getDb().project.findMany({
    where: scope === "public" ? { status: "completed" } : undefined,
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map(toProgramme);
}

async function findProgramme(slug: string, scope: "public" | "all"): Promise<Programme | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("projects", `project:${slug}`);
  const row = await getDb().project.findFirst({
    where: scope === "public" ? { slug, status: "completed" } : { slug },
  });
  return row ? toProgramme(row) : null;
}

/** Completed programmes, for everyone. */
export function getPublicProgrammes() {
  return listProgrammes("public");
}

/** A completed programme, for everyone. In-progress work is never returned here. */
export function getPublicProgramme(slug: string) {
  return findProgramme(slug, "public");
}

/** Every programme, including work in progress. Members only. */
export async function getWorkspaceProgrammes(): Promise<Programme[]> {
  await requireMember();
  return listProgrammes("all");
}

/** Any programme by slug. Members only. */
export async function getWorkspaceProgramme(slug: string): Promise<Programme | null> {
  await requireMember(`/workspace/research/${slug}`);
  return findProgramme(slug, "all");
}
