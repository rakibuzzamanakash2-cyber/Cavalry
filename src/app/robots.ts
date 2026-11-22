import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private areas are behind sign-in anyway; this keeps crawlers out of them.
      disallow: ["/workspace", "/admin", "/api/", "/members-only"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
