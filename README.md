# CAVALRY research — website

The public website of CAVALRY research: an independent research group that investigates important problems with rigorous, reproducible methods and turns validated findings into useful tools.

**Research. Develop. Build.**

## Tech stack

| Layer      | Choice                                                     |
| ---------- | ---------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Cache Components) + TypeScript     |
| Styling    | Tailwind CSS v4 with brand tokens in `src/app/globals.css` |
| Database   | PostgreSQL on Supabase                                     |
| ORM        | Drizzle ORM + drizzle-kit migrations                       |
| Validation | Zod                                                        |
| Fonts      | Source Serif 4 (headings), Inter (body), self-hosted       |
| Hosting    | Vercel                                                     |
| CI         | GitHub Actions: lint, typecheck, format, migrations, build |

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

## Project structure

```
src/
  app/            routes, layout, global styles
  components/     shared UI (header, footer, wordmark)
  db/             schema.ts, client (index.ts), cached queries, seed
  lib/            env validation, site settings
drizzle/          generated SQL migrations (commit these)
docs/decisions/   architecture decision records
```

## Brand

Palette A — Deep Teal & Copper. Use the semantic Tailwind classes, never raw hex values:

| Token           | Hex       | Use                        |
| --------------- | --------- | -------------------------- |
| `primary`       | `#0E3B43` | backgrounds, headings      |
| `accent`        | `#C8553D` | large text, icons, buttons |
| `accent-strong` | `#A8432E` | small text and links       |
| `surface`       | `#F6F3EC` | page background            |
| `sand`          | `#EDE6D6` | panels, callouts           |
| `ink`           | `#1B1F24` | body text                  |
| `muted`         | `#5B6770` | captions, metadata         |
| `line`          | `#CFC6B4` | borders                    |
