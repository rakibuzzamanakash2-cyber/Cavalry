# ADR 0005 — Project ratings and the team directory

- Status: Accepted
- Date: 2026-11-24
- Deciders: Rakib, Rubayet

## Context

Leaders want to record how well each person did on their project, and the team wants one place showing who works on what and how each person is doing overall. Ratings are internal: they are never shown on the public site.

## Decision

- **Per-project rating:** each project membership has an optional `rating` (1–5 whole stars), with `rated_at` and `rated_by_id`. A rating belongs to one person on one project, not to the person overall.
- **Who rates:** the project leader or an admin (the same people who manage the team). Nobody rates themselves, so an admin rates the team leader. Ratings can be changed at any time; the latest one counts.
- **Who sees it:** the project's team sees everyone's rating on the project team page, read-only. Only the leader and admins get the controls.
- **Overall rating:** the average of a person's project ratings, to one decimal place, ignoring projects where they have not been rated. It is shown on `/workspace/team` together with how many ratings it comes from.
- **Team directory** (`/workspace/team`, members only): everyone with the member or admin role, their projects and roles, and every project team. Project titles link only for people who can open the project; no research details appear there.
- Leaving a project removes its rating (it lives on the membership).

## Consequences

- Any member can see every other member's overall rating. If that is too open later, the directory can show it to admins only without a schema change.
- 1–5 is checked in the server action (Zod), not by a database constraint.
