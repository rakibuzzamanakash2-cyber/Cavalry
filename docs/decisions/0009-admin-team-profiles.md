# ADR 0009 — Team profiles and open roles managed on the site

- Status: Accepted
- Date: 2026-11-25
- Deciders: Rakib, Rubayet

## Context

The public team page (people and open roles) was the last content that still came from `src/content` through the seed.

## Decision

- Admins manage it at `/admin/team`: add, edit and delete profiles (name, role, focus, bio, photo, LinkedIn, GitHub, Google Scholar, co-founder, shown or hidden, order) and open roles (title, background, what they own, open or closed, order).
- Hiding a profile or closing a role removes it from the public page without deleting it.
- A photo can be a file in `public/` (e.g. `/team/rakib.jpg`) or an https link; linked photos are shown as they are (not resized by Next).
- Links must be https and open in a new tab with `rel="noopener noreferrer"`; each link names the person for screen readers.
- These public profiles are separate from workspace accounts: someone can have an account without a public profile, and the other way round.
- The seed now creates missing rows only and never overwrites anything, so all site content is edited on the site.

## Consequences

- `src/content/*` is seed data for a fresh database only.
