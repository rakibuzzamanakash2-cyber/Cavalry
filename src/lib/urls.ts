// Where the site runs. Locally: localhost. On Vercel the URLs are worked out
// from Vercel's own variables, so nothing breaks if one isn't set by hand.

const https = (host?: string) => (host ? `https://${host}` : undefined);

/** The public site URL (canonical links, sitemap, emails). */
export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    https(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    https(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

/**
 * The URL Better Auth runs on. Preview deployments use their own branch URL,
 * so signing in works there too; production uses the site URL.
 */
export function authUrl() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL.replace(/\/+$/, "");
  if (process.env.VERCEL_ENV === "preview") {
    const preview = https(process.env.VERCEL_BRANCH_URL) || https(process.env.VERCEL_URL);
    if (preview) return preview;
  }
  return siteUrl();
}

/** Origins allowed to call the auth API (CSRF/origin checks). */
export function trustedOrigins() {
  return [
    authUrl(),
    siteUrl(),
    https(process.env.VERCEL_URL),
    https(process.env.VERCEL_BRANCH_URL),
  ].filter((o, i, all): o is string => Boolean(o) && all.indexOf(o) === i);
}
