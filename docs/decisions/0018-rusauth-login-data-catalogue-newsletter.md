# ADR 0018 — Ru'sAuth login and sign-up, public data catalogue and newsletter

- Status: Accepted
- Date: 2026-11-27
- Deciders: Rakib, Rubayet

## Context

Rubayet's [Ru'sAuth](https://github.com/rubayet-off/Ru-sAuth) is a complete authentication system (its own JWT sessions, email codes, single-admin login, Cloudinary photos). We wanted its login and sign-up experience, while keeping Google sign-in, sign-in by account ID or username (ADR 0015) and several admins. We also wanted a public place for finished datasets and a way for readers to get updates.

## Decision

**Login and sign-up.** Ru'sAuth's login and sign-up code is ported: `AuthCard`, `IconField`, `PasswordField` (with show/hide), `GoogleButton`, `OrDivider`, its toasts (Zustand) and validation rules (8–72 characters for passwords), its `@mynaui/icons-react` icons and Google logo, and its pages at `/login` and `/registration` (old `/sign-in` and `/sign-up` addresses redirect, keeping `?next=`). Colours use our tokens, and every field has a screen-reader label.

Better Auth stays the engine underneath: sessions, roles, invites, Google OAuth, rate limits and the ID/username sign-in hook keep working, and accounts don't change. Ru'sAuth's other features (sessions list, single admin, photos) are not part of this change. Admin remains a role, so several people can be admins.

Sign-up asks for full name, username, email and password. The username is checked on the server before the account is created and can't be changed through the auth API afterwards (only on `/account`).

**Confirmation email.** Every new account, by email or Google, gets a "your account has been created" email with its ID, sent after the response with Ru'sAuth's nodemailer/Gmail transport (`EMAIL_USER`, `EMAIL_PASS`). Without credentials nothing is sent. Mail failures never block sign-up. After sign-up, `/welcome` confirms the account and shows the ID.

**Public data catalogue.** Admins publish datasets from `/admin/datasets` with a licence. Published datasets appear at `/data` and `/data/<slug>` with a download link, licence, citation (reference, BibTeX, RIS) and schema.org `Dataset` data. A dataset whose project is still in progress cannot be published, and the public reader also excludes such datasets.

**Newsletter.** A sign-up form in the footer and at `/newsletter` stores only the email address. It is rate-limited per visitor, has a honeypot for bots, and gives the same reply for new and existing addresses. A welcome email carries an unsubscribe link, and `/newsletter/unsubscribe` deletes the address after a click. Admins see subscribers at `/admin/subscribers` and can download a CSV (with each person's unsubscribe link) to send updates from a mail service.

## Consequences

- Production needs `EMAIL_USER` and `EMAIL_PASS` for emails to go out.
- Tests write emails to `.mail-outbox/` (`MAIL_OUTBOX_DIR`) and read them back.

## Update: forgot password

Ru'sAuth's password reset is ported too: `/forgot-password` (email), `/otp-verification` (6-digit code) and `/new-password`, linked from the login page. Underneath it is Better Auth's email-OTP plugin, limited to password reset: codes are stored hashed, expire after 10 minutes, allow 5 tries and are rate-limited; the reply is the same whether or not the email has an account. A reset signs out every device and emails a "your password was changed" notice. Signing in or verifying by emailed code is switched off. A Google-only account that resets gets a password as well.
