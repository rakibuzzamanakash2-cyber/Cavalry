import "server-only";
import { and, asc, desc, eq, isNotNull, lte } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "./index";
import { newsPosts, projects, publications, teamMembers } from "./schema";

// Read-only data access for public pages. Results are cached and tagged so
// content edits can be revalidated with revalidateTag("<tag>").

export async function listTeamMembers() {
  "use cache";
  cacheLife("hours");
  cacheTag("team");
  return getDb()
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.isActive, true))
    .orderBy(asc(teamMembers.sortOrder), asc(teamMembers.name));
}

export async function listProjects() {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  return getDb()
    .select()
    .from(projects)
    .orderBy(desc(projects.isFeatured), asc(projects.sortOrder));
}

export async function getProjectBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("projects", `project:${slug}`);
  const rows = await getDb().select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function listPublications() {
  "use cache";
  cacheLife("hours");
  cacheTag("publications");
  return getDb()
    .select()
    .from(publications)
    .orderBy(desc(publications.year), asc(publications.title));
}

export async function listPublishedNews(limit = 20) {
  "use cache";
  cacheLife("hours");
  cacheTag("news");
  return getDb()
    .select()
    .from(newsPosts)
    .where(and(isNotNull(newsPosts.publishedAt), lte(newsPosts.publishedAt, new Date())))
    .orderBy(desc(newsPosts.publishedAt))
    .limit(limit);
}

export async function getNewsPostBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("news", `news:${slug}`);
  const rows = await getDb()
    .select()
    .from(newsPosts)
    .where(and(eq(newsPosts.slug, slug), isNotNull(newsPosts.publishedAt)))
    .limit(1);
  return rows[0] ?? null;
}
