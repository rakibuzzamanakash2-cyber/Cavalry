import type { MetadataRoute } from "next";
import { posts } from "@/content/news";
import { programmes } from "@/content/research";
import { site } from "@/lib/site";

// Dates come from content (not new Date()) so the sitemap stays static.
export default function sitemap(): MetadataRoute.Sitemap {
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
