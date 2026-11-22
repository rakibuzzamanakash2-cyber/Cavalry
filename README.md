# CAVALRY research — website

The public website of CAVALRY research: an independent research group that investigates important problems with rigorous, reproducible methods and turns validated findings into useful tools.

**Research. Develop. Build.**

## Tech stack

| Layer      | Choice                                                                    |
| ---------- | ------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Cache Components) + TypeScript                    |
| Styling    | Tailwind CSS v4 with brand tokens in `src/app/globals.css`                |
| Database   | PostgreSQL on Supabase                                                    |
| ORM        | Drizzle ORM + drizzle-kit migrations                                      |
| Validation | Zod                                                                       |
| Fonts      | Cormorant Garamond (headings), Inter (body), self-hosted                  |
| Hosting    | Vercel                                                                    |
| CI         | GitHub Actions: lint, typecheck, format, migrations, build, browser tests |

Why these choices: see [`docs/decisions/0001-tech-stack.md`](docs/decisions/0001-tech-stack.md).

## Getting started

Requirements: Node.js 22+ and a Supabase project.

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase connection strings
npm run db:migrate           # create the tables
npm run db:seed              # optional: starter team + flagship project
npm run dev                  # http://localhost:3000
```

## Scripts

| Command               | What it does                                        |
| --------------------- | --------------------------------------------------- |
| `npm run dev`         | Start the dev server                                |
| `npm run build`       | Production build                                    |
| `npm run check`       | Lint + typecheck + format check (run before a PR)   |
| `npm run format`      | Format all files with Prettier                      |
| `npm run db:generate` | Create a migration after editing `src/db/schema.ts` |
| `npm run db:migrate`  | Apply migrations to the database                    |
| `npm run db:studio`   | Browse the database in Drizzle Studio               |
| `npm run db:seed`     | Insert starter content                              |

## Browser tests

`e2e/` holds Playwright tests that run against the production build: no sideways scroll from 320px phones to desktop in both themes, the home page fitting one screen on laptops, the theme toggle, the mobile menu, and an axe accessibility audit. Run `npm run build` once, then `npm run test:e2e` (first time: `npx playwright install chromium`).

## Project structure

```
src/
  app/            routes, layout, global styles
  components/     shared UI (header, footer, logo, stage tracker)
  content/        research, team, publications and news content (edit here)
  db/             schema.ts, client (index.ts), cached queries, seed
  lib/            env validation, site settings
drizzle/          generated SQL migrations (commit these)
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
