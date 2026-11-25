<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions (CAVALRY research website)

- Stack: Next.js 16 App Router + TypeScript, Tailwind v4, Prisma 7 on Neon Postgres. See `docs/decisions/`.
- Colours: use semantic tokens from `src/app/globals.css` (`bg-primary`, `text-accent-strong`, …). Never hard-code hex values in components.
- Data: pages read through `src/data/*`. Public getters return finished work only; workspace getters call `requireMember()` first. Keep cached readers unexported. Never import `src/lib/db.ts` into client components.
- Access: research in progress is confidential. Never render it on public pages. Session reads (`getCurrentUser`, `require*`) must sit inside `<Suspense>`. Server actions re-check permissions themselves.
- Projects: every project page and action goes through `src/lib/project-access.ts` (`canView` = team or admin, `canManage` = leader or admin). Members outside a project's team see its title, leader and stage only.
- Forms: give inputs ids from `useId()`, not fixed strings. Next keeps the previous page mounted (hidden) after client navigation, so fixed ids can clash.
- Schema changes: edit `prisma/schema.prisma`, run `npm run db:migrate:dev -- --name <change>`, and commit `prisma/migrations`. Keep `src/content/*`, the seed and `src/data/*` mappings in step.
- Before opening a PR run `npm run check` and `npm run build`.
- Commits: short, natural, human-sounding messages.
