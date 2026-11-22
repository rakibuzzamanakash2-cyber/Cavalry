import type { MetadataRoute } from "next";
import { getPosts } from "@/data/news";
import { getProgrammes } from "@/data/programmes";
import { site } from "@/lib/site";

// Dates come from content (not new Date()) so the sitemap stays static.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programmes, posts] = await Promise.all([getProgrammes(), getPosts()]);
  const staticPages = ["", "/about", "/research", "/publications", "/team", "/news", "/contact"];
  return [
    ...staticPages.map((path) => ({ url: `${site.url}${path}` })),
    ...programmes.map((p) => ({
      url: `${site.url}/research/${p.slug}`,
      lastModified: p.lastUpdated,
    })),
    ...posts.map((p) => ({ url: `${site.url}/news/${p.slug}`, lastModified: p.date })),
  ];
}
