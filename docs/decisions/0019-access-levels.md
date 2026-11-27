# ADR 0019 — Access levels: who can see what

- Status: Accepted
- Date: 2026-11-27
- Deciders: Rakib, Rubayet

## Context

Access was already enforced on the server (`requireUser`, `requireMember`, `requireAdmin`, `project-access.ts` and the data getters), but nowhere did the site say who can see what. People also couldn't see which level they were at. Separately, a member who opened an admin page landed on a page telling them they were "not a member yet".

## Decision

Four levels: visitor, signed-in user, member and admin. Visitors see the public site and finished work; signed-in users also get their account and can apply; members get the research workspace, with a project's details only for its own team; admins run the site.

- Anyone can create an account, so signed-in users who are not members see nothing of the research beyond the public site (decided with the founders). What they gain is their account, applying to join, and their application status.
- A **Your access** panel tells each person their own level and how to get further, on the account page and the private-area page.
- `/members-only` now says the right thing for each case: visitors are asked to log in, signed-in users to apply, and members who reach an admin page are told it's for admins.
- `e2e/access-levels.spec.ts` checks every level against the main areas.

## Consequences

- Changing who can see something means updating the test along with the code.

## Update: no public map

A "who can see what" table was briefly shown on How we work and in the Your access panel. It was removed: a full map of private areas helps someone probing the site and adds little for readers. People are told only their own level. Security still rests on the server-side checks, not on the map being hidden.
