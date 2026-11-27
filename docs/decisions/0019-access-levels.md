# ADR 0019 — Access levels: who can see what

- Status: Accepted
- Date: 2026-11-27
- Deciders: Rakib, Rubayet

## Context

Access was already enforced on the server (`requireUser`, `requireMember`, `requireAdmin`, `project-access.ts` and the data getters), but nowhere did the site say who can see what. People also couldn't see which level they were at. Separately, a member who opened an admin page landed on a page telling them they were "not a member yet".

## Decision

Four levels, described once in `src/content/access.ts`:

|                                            | Visitor | Signed-in user | Member                  | Admin |
| ------------------------------------------ | ------- | -------------- | ----------------------- | ----- |
| Public site and finished work              | yes     | yes            | yes                     | yes   |
| Your account and application               | –       | yes            | yes                     | yes   |
| Workspace, team directory, shared datasets | –       | –              | yes                     | yes   |
| Project details                            | –       | –              | own projects            | yes   |
| Other projects                             | –       | –              | title, leader and stage | yes   |
| Administration                             | –       | –              | –                       | yes   |

- Anyone can create an account, so signed-in users who are not members see nothing of the research beyond the public site (decided with the founders). What they gain is their account, applying to join, and their application status.
- The table appears publicly on **How we work**. A **Your access** panel shows the viewer's own level on the account page and on the private-area page.
- `/members-only` now says the right thing for each case: visitors are asked to log in, signed-in users to apply, and members who reach an admin page are told it's for admins.
- `e2e/access-levels.spec.ts` checks every level against the main areas, so the table and the real rules can't drift apart.

## Consequences

- Changing who can see something now means updating `src/content/access.ts` and the test along with the code.
