# ADR 0010 — Deploying on Vercel

- Status: Accepted
- Date: 2026-11-25
- Deciders: Rakib, Rubayet

## Context

The site runs on Next.js 16 with a Neon database in Singapore. It needs a host with good Next.js support, preview deployments for pull requests, and a free tier while we are small.

## Decision

- **Vercel**, with functions in `sin1` (Singapore), next to the Neon database (`vercel.json`).
- **Builds** use `npm run vercel-build` (`scripts/vercel-build.mjs`). Production builds run `prisma migrate deploy` first, using `DIRECT_URL`; preview builds never change the schema. The build fails early if required variables are missing.
- **Databases:** production uses the Neon `main` branch. Preview deployments should use a separate Neon branch (e.g. `preview`), so testing a pull request never touches real data.
- **URLs are worked out automatically** (`src/lib/urls.ts`): the site URL falls back to Vercel's production URL, and auth runs on the preview's own URL in previews, so sign-in works there too. `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_URL` are only needed once there is a custom domain.
- **Rate limits** for sign-in and sign-up are stored in the database (`rate_limit` table). Memory limits would reset on every serverless instance.
- **Security headers** on every response: `nosniff`, `X-Frame-Options: DENY`, a strict referrer policy and a permissions policy; the `X-Powered-By` header is off. Vercel adds HSTS.
- On Vercel, auth refuses to start without a 32+ character `BETTER_AUTH_SECRET`.

## Consequences

- Merging to `main` deploys to production and migrates the production database automatically. Migrations must stay additive or be split into safe steps.
- Google sign-in needs the production (and, if wanted, preview) callback URL added in Google Cloud: `<url>/api/auth/callback/google`.
