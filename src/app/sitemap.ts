import type { MetadataRoute } from "next";
import { getPublicPosts } from "@/data/news";
import { researchAreas } from "@/content/research";
import { getPublicProgrammes } from "@/data/programmes";
import { getPeople } from "@/data/team";
import { site } from "@/lib/site";

// Public pages only. Dates come from content (not new Date()) so the sitemap stays static.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programmes, posts, people] = await Promise.all([
    getPublicProgrammes(),
    getPublicPosts(),
    getPeople(),
  ]);
  const staticPages = [
    "",
    "/about",
    "/research",
    "/how-we-work",
    "/publications",
    "/team",
    "/news",
    "/contact",
  ];
  return [
    ...staticPages.map((path) => ({ url: `${site.url}${path}` })),
    ...programmes.map((p) => ({
      url: `${site.url}/research/${p.slug}`,
      lastModified: p.lastUpdated,
    })),
    ...researchAreas.map((a) => ({ url: `${site.url}/research/areas/${a.slug}` })),
    ...people.map((p) => ({ url: `${site.url}/team/${p.slug}` })),
    ...posts.map((p) => ({ url: `${site.url}/news/${p.slug}`, lastModified: p.date })),
  ];
}
