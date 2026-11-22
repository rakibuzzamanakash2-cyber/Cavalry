# ADR 0003 — Access model and authentication

- Status: Accepted
- Date: 2026-11-22
- Deciders: Rakib, Rubayet

## Context

Research in progress is confidential. The public should see only an overview of the organisation and finished work. People can sign in to apply to work with us, and only members (researchers) and admins can see research in progress.

## Decision

- **Better Auth** (Prisma adapter) for accounts: email and password, plus Google when `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set.
- One platform role per user, stored on `user.role`:
  - `user` — signed in; sees the public site (and, later, can apply).
  - `member` — researcher; sees `/workspace`.
  - `admin` — manages users and roles at `/admin/users`.
- New accounts are always `user`. Emails listed in `ADMIN_EMAILS` become `admin` automatically **only** when the provider has verified the email (e.g. Google); unverified email/password sign-ups are never promoted. `npm run user:role -- <email> <role>` sets a role from the command line.
- Membership is granted by an admin (role change) or, later, by an approved application or an invitation.
- Public data getters return completed programmes, published outputs and public news only. Workspace getters call `requireMember()` before reading. Cached readers are not exported, so no page can skip the check.
- `src/proxy.ts` redirects requests to `/workspace` and `/admin` without a session cookie straight to sign-in (an optimistic check for speed; the real checks are on the server).
- Changing a role deletes that user's sessions so the change applies on their next request.
- Better Auth's default rate limits stay on (3 sign-in or sign-up attempts per 10 seconds per IP).

## Consequences

- The site needs the database at build and run time; the content-file fallback was removed.
- In-progress research must never be put in public getters or public pages. The browser tests scan every public page for confidential text.
- The GitHub repository should be private, because `src/content` (the seed source) contains research plans.
- Email verification and password reset need an email provider; until then, email/password accounts are unverified and cannot be auto-promoted.
