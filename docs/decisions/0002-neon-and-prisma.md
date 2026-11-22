# ADR 0002 — Neon for the database, Prisma for data access

- Status: Accepted (supersedes the database and ORM parts of ADR 0001)
- Date: 2026-11-22
- Deciders: Rakib, Rubayet

## Context

ADR 0001 chose Supabase and Drizzle. The founders prefer Neon as the Postgres host and Prisma as the ORM. Version 1 of the site needs a database only for content (team, programmes, publications, news); it does not need Supabase's auth or storage yet.

## Decision

- **Neon** (Singapore region, the closest Neon region to Dhaka) hosts PostgreSQL. The site uses Neon's **pooled** connection (`DATABASE_URL`, hostname with `-pooler`); migrations and seeding use the **direct** connection (`DIRECT_URL`).
- **Prisma 7** with the `prisma-client` generator and the `@prisma/adapter-pg` driver adapter. The client is generated into `src/generated/prisma` (git-ignored, created by `postinstall`).
- Structured programme details (sub-questions, data sources, stages, ...) are JSON columns, validated with Zod when read.
- `src/content/*` stays as the source for the seed script and as the fallback when `DATABASE_URL` is not set, so the site runs before the database exists.

## Consequences

- Content edits made in the database appear on the site within an hour (pages are cached with `cacheLife("hours")`), or immediately after a redeploy.
- Schema changes go through `npm run db:migrate:dev -- --name <change>`; CI fails if `schema.prisma` and `prisma/migrations` drift apart, then applies migrations, seeds and builds against a real Postgres.
- Neon does not expose tables through a public API by default, so the row-level-security setup from ADR 0001 is no longer needed.
- If login or file uploads are needed later (admin panel, photos), they are added separately — for example Auth.js and an object store.
