<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions (CAVALRY research website)

- Stack: Next.js 16 App Router + TypeScript, Tailwind v4, Drizzle ORM on Supabase Postgres. See `docs/decisions/`.
- Colours: use semantic tokens from `src/app/globals.css` (`bg-primary`, `text-accent-strong`, …). Never hard-code hex values in components.
- Data: read through `src/db/queries.ts` (cached with `"use cache"`, `cacheLife`, `cacheTag`). Do not import `src/db/index.ts` into client components.
- Schema changes: edit `src/db/schema.ts`, then `npm run db:generate` and commit the SQL in `drizzle/`. Keep `.enableRLS()` on every table.
- Before opening a PR run `npm run check` and `npm run build`.
- Commits: short, natural, human-sounding messages.
