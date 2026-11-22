# CAVALRY research — website

The public website of CAVALRY research: an independent research group that investigates important problems with rigorous, reproducible methods and turns validated findings into useful tools.

**Research. Develop. Build.**

## Tech stack

| Layer      | Choice                                                                    |
| ---------- | ------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Cache Components) + TypeScript                    |
| Styling    | Tailwind CSS v4 with brand tokens in `src/app/globals.css`                |
| Database   | PostgreSQL on Neon                                                        |
| ORM        | Prisma 7 (driver adapter `@prisma/adapter-pg`) + Prisma Migrate           |
| Validation | Zod                                                                       |
| Fonts      | Cormorant Garamond (headings), Inter (body), self-hosted                  |
| Hosting    | Vercel                                                                    |
| CI         | GitHub Actions: lint, typecheck, format, migrations, build, browser tests |

Why these choices: see [`docs/decisions/`](docs/decisions/) — ADR 0001 (stack), ADR 0002 (Neon and Prisma), ADR 0003 (access model and auth).

## Getting started

Requirements: Node.js 22+ and a Neon database.

```bash
npm install                  # also generates the Prisma client
cp .env.example .env.local
npm run dev                  # http://localhost:3000
```

### Connecting Neon

1. Create a project at neon.tech in **AWS Asia Pacific (Singapore)**.
2. Click **Connect**. Copy the string with **Connection pooling** on into `DATABASE_URL`, and with it off into `DIRECT_URL`.
3. Create the tables and load the content:

```bash
npm run db:migrate   # applies prisma/migrations
npm run db:seed      # copies src/content into the database (safe to re-run)
```

### Accounts and roles

1. Set `BETTER_AUTH_SECRET` (32+ random characters) and `BETTER_AUTH_URL` in `.env.local`.
2. Put the founders' emails in `ADMIN_EMAILS` (comma-separated).
3. Optional, Google sign-in: create an OAuth client in Google Cloud Console with the redirect URI `<site URL>/api/auth/callback/google`, then set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
4. Sign up on the site. Founders who sign in with Google become admins automatically; otherwise run `npm run user:role -- you@example.com admin`.

| Role     | Sees                               |
| -------- | ---------------------------------- |
| visitor  | Public overview and finished work  |
| `user`   | Same (applications coming)         |
| `member` | `/workspace`: research in progress |
| `admin`  | Everything, plus `/admin/users`    |

See ADR 0003 for the access rules.

### Deploying on Vercel

Add `DATABASE_URL` (pooled), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` (both your real URL), `ADMIN_EMAILS`, and the Google keys if used.

## Scripts

| Command                  | What it does                                      |
| ------------------------ | ------------------------------------------------- |
| `npm run dev`            | Start the dev server                              |
| `npm run build`          | Production build                                  |
| `npm run check`          | Lint + typecheck + format check (run before a PR) |
| `npm run format`         | Format all files with Prettier                    |
| `npm run db:migrate`     | Apply migrations (production / Neon)              |
| `npm run db:migrate:dev` | Create a migration after editing `schema.prisma`  |
| `npm run db:seed`        | Copy `src/content` into the database              |
| `npm run db:status`      | Show which migrations are applied                 |
| `npm run db:studio`      | Browse the database in Prisma Studio              |

## Browser tests

`e2e/` holds Playwright tests that run against the production build: no sideways scroll from 320px phones to desktop in both themes, the home page fitting one screen on laptops, the theme toggle, the mobile menu, and an axe accessibility audit. Run `npm run build` once, then `npm run test:e2e` (first time: `npx playwright install chromium`).

## Project structure

```
src/
  app/            routes, layout, global styles
  components/     shared UI (header, footer, logo, stage tracker)
  content/        research, team, publications and news content (edit here)
  data/           cached data access (database, or content files as fallback)
  generated/      Prisma client (generated, not committed)
  lib/            database client, env validation, site settings
prisma/           schema.prisma, migrations (commit these), seed.ts
docs/decisions/   architecture decision records
```

## Brand

The logo files are `public/brand/cavalry-logo.svg` (with tagline) and `public/brand/cavalry-wordmark.svg` (without). `src/components/logo.tsx` draws them as a CSS mask over the text colour, so they recolour with `text-*` classes and both themes. Use `<Logo withTagline={false} />` where space is tight.

Palette — Ink & Parchment with an oxblood accent, matched to the calligraphic logo, in light and dark themes. The theme follows the visitor's system setting until they pick one with the toggle (saved in `localStorage`). Use the semantic Tailwind classes, never raw hex values; both themes are defined only in `src/app/globals.css`.

| Token           | Light     | Dark      | Use                     |
| --------------- | --------- | --------- | ----------------------- |
| `primary`       | `#17140F` | `#EFE7D8` | logo, headings, buttons |
| `accent`        | `#6E1F28` | `#CC6B74` | rules, hover states     |
| `accent-strong` | `#5A1820` | `#E0959B` | small text and links    |
| `surface`       | `#F4EEE3` | `#13110D` | page background         |
| `sand`          | `#E9E0CF` | `#1F1B16` | panels, callouts        |
| `ink`           | `#17140F` | `#E9E1D2` | body text               |
| `muted`         | `#6A6155` | `#A1978A` | captions, metadata      |
| `line`          | `#C9BCA5` | `#4A4238` | borders                 |
