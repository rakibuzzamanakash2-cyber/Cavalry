import type { NextConfig } from "next";

// Safe defaults for every response. (Vercel adds HSTS on its domains.)
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Sign-in moved to Ru'sAuth-style pages (ADR 0018). Query strings such as
  // ?next=/workspace are passed through.
  async redirects() {
    return [
      { source: "/sign-in", destination: "/login", permanent: true },
      { source: "/sign-up", destination: "/registration", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
