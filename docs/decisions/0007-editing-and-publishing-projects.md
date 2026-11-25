# ADR 0007 — Editing and publishing projects on the site

- Status: Accepted
- Date: 2026-11-25
- Deciders: Rakib, Rubayet

## Context

Project content lived in `src/content/research.ts` and the seed, so every change to a research plan needed a code change. Leaders need to keep their plans current themselves, and publishing finished work should be a deliberate step.

## Decision

- **Editor** at `/workspace/projects/<slug>/edit` for the project leader and admins. It covers the basics (title, summary, question, areas, leads, status label, current stage) and every list section (why it matters, sub-questions, design, data, approach, scope, roadmap stages, outputs, commitments, highlights). Rows can be added, removed and reordered.
- The whole plan is sent as one JSON payload and validated on the server with one Zod schema (`src/lib/project-content.ts`) that also sets limits: lengths, at most 20 rows per list, at least one roadmap stage. The save action re-checks that the user is the leader or an admin.
- Saving updates "last updated". The URL (slug) never changes, so links keep working.
- **Publishing is admin-only.** Status is planning, in progress, paused or completed. Only "completed" puts the project on the public site; admins can take it down again. Each save or status change clears the public cache (`updateTag("projects")`).
- The seed only creates projects that don't exist yet (it upserts by slug), so the database is now the source of truth for project content.

## Consequences

- `src/content/research.ts` is now only seed data for a fresh database. Edits made on the site are not written back to it.
- A leader's edits to a published project go live on the public site straight away; the editor says so.
