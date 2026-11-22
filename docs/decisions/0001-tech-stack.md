# ADR 0001 — Tech stack for the CAVALRY research website

- Status: Accepted — database and ORM superseded by [ADR 0002](0002-neon-and-prisma.md)
- Date: 2026-11-22
- Deciders: Rakib, Rubayet

## Context

The site is the public face of a small research group. Version 1 is public pages only: home, about, research projects, publications, team, news and contact. Content (team, projects, publications, news) changes often enough that it should live in a database rather than in code, so an admin panel can be added later without a rewrite. The team is two founders plus student members, so the stack must be free to host, well documented and quick to work in.

## Decision

- **Next.js 16 + TypeScript** (App Router, Cache Components). One codebase for pages and, later, API routes and an admin area. Server components read the database directly; pages are prerendered and cached.
- **PostgreSQL on Supabase.** Free tier, managed backups, and built-in auth and file storage for when the admin panel and image uploads arrive.
- **Drizzle ORM.** Schema in TypeScript, plain SQL migrations committed to the repo, no engine binary (smaller serverless bundles on Vercel). Prisma was considered; Drizzle was chosen because it needs no engine download and its migrations are readable SQL.
- **Tailwind CSS v4** with semantic brand tokens defined once in `globals.css`.
- **Vercel** for hosting; **GitHub Actions** for CI.

## Consequences

- All tables have row-level security enabled with no policies, so Supabase's public REST API exposes nothing. The site reads through a server-side database connection only. Policies are added deliberately if client-side access is ever needed.
- Data reads use `"use cache"` with tags (`team`, `projects`, `publications`, `news`), so future admin edits call `revalidateTag()` to refresh pages.
- The app runtime uses Supabase's transaction pooler (port 6543, `prepare: false`); migrations use a session or direct connection (port 5432).
- Schema changes always go through `npm run db:generate`; CI fails if the schema and migrations drift apart.
