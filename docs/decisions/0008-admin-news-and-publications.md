# ADR 0008 — News and publications managed on the site

- Status: Accepted
- Date: 2026-11-25
- Deciders: Rakib, Rubayet

## Context

News posts and publications came from `src/content/*` through the seed, so every update needed a code change and a deploy.

## Decision

- Admins manage both at `/admin/news` and `/admin/publications`, with tabs across all admin pages. Create, edit and delete; every action calls `requireAdmin()` itself.
- **News:** title, summary, text (paragraphs separated by a blank line), tags, who can read it (everyone or members only) and state (draft or published). Drafts appear nowhere. A published post keeps its original date when edited.
- **Publications:** title, type, status, authors, year, venue, abstract, optional https links (page, PDF), DOI and an optional programme. Only status "published" appears on the public site; the rest stays in the workspace. A DOI pasted as a doi.org link is stored as the bare DOI.
- A public publication links to its programme only if that programme is itself public (completed), so a published brief cannot reveal research in progress.
- The public publications page now shows the Read, PDF and DOI links.
- Saves clear the public caches (`updateTag("news")`, `updateTag("publications")`). URLs (slugs) are made from the title once and never change.
- The seed creates missing news posts and publications but no longer overwrites them.

## Consequences

- `src/content/news.ts` and `src/content/publications.ts` are now only seed data for a fresh database.
- Team profiles and open roles still come from `src/content/team.ts`; moving them to the admin is the next step.
