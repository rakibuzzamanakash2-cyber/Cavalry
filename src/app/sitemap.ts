import type { MetadataRoute } from "next";
import { getPublicPosts } from "@/data/news";
import { getPublicProgrammes } from "@/data/programmes";
import { site } from "@/lib/site";

// Public pages only. Dates come from content (not new Date()) so the sitemap stays static.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programmes, posts] = await Promise.all([getPublicProgrammes(), getPublicPosts()]);
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
