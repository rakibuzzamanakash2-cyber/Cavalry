import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Programme } from "@/content/research";
import { getDb } from "@/lib/db";
import { toProgramme } from "./projects";

// Public programme data: completed work only, for everyone. Research in
// progress is read through src/data/projects.ts, which checks project access.

async function listCompleted(): Promise<Programme[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  const rows = await getDb().project.findMany({
    where: { status: "completed" },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map(toProgramme);
}

async function findCompleted(slug: string): Promise<Programme | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("projects", `project:${slug}`);
  const row = await getDb().project.findFirst({ where: { slug, status: "completed" } });
  return row ? toProgramme(row) : null;
}

/** Completed programmes, for everyone. */
export function getPublicProgrammes() {
  return listCompleted();
}

/** A completed programme, for everyone. In-progress work is never returned here. */
export function getPublicProgramme(slug: string) {
  return findCompleted(slug);
}
