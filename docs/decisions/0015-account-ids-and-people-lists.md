# ADR 0015 — Account IDs, usernames and people lists

- Status: Accepted
- Date: 2026-11-27
- Deciders: Rakib, Rubayet

## Context

The site has three levels of access: visitors see the public site, signed-in users can apply, and members (who join through an accepted application or a project invite) see the workspace. Members were still being invited to "apply" across the site. Accounts had no short ID, people could only sign in with their email, and the user and team lists were unsorted with no search.

## Decision

- **Account ID:** every account gets a permanent ID such as `CAV00012`, given by the database from a sequence in sign-up order (existing accounts were numbered by sign-up date). It is shown on the account page, in the account menu and in people lists.
- **Username:** optional, chosen on `/account`; 3–30 lowercase letters, numbers, dots or underscores; unique; cannot look like an ID.
- **Sign-in:** one field takes an email, a username or an ID. A Better Auth `before` hook on `/sign-in/email` swaps a username or ID for the account's email, so the normal password check and rate limit still apply. Unknown names fail exactly like a wrong password and reveal nothing.
- **Joining:** apply links are shown to visitors and signed-in non-members only. Members see a workspace link instead, and the home page's closing band shows their projects.
- **People lists:** `/admin/users` and `/workspace/team` are sorted admin → leader (leads or co-leads a project) → member → user, then by name, with a search box (name, email, username or ID; email is admin-only) and role tabs. Both use plain GET links and forms, so they work without JavaScript.

## Consequences

- Signing in with a username or ID needs one extra database read.
- IDs are never reused or changed.
