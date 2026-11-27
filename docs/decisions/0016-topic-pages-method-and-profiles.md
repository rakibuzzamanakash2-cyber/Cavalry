# ADR 0016 — Research area pages, "How we work" and profile pages

- Status: Accepted
- Date: 2026-11-27
- Deciders: Rakib, Rubayet

## Context

Leading research organisations organise their sites by topic, explain their method on its own page and give every researcher a profile that their publications link to (ADR 0014). Our research areas were only short cards, our method was a section of the research page, and team members had no page of their own.

## Decision

- **Research area pages** at `/research/areas/<slug>`: an introduction, the questions we ask, how we approach them, published programmes and outputs in the area, and links to the other areas. The copy lives in `src/content/research.ts` and stays general; research in progress is never described there. `/research/areas` redirects to the research page.
- **How we work** at `/how-we-work`, in the main navigation: the four principles in full, the five stages with the gate each must pass, working standards for data, code, causal and predictive claims, and review, what we keep private and what we share, and how teams work.
- **Profile pages** at `/team/<slug>` for everyone on the public team page, with bio, focus, contact links, schema.org Person data and their published work. Team cards link to them, and author names on publications link to the matching profile (exact name match, case-insensitive).
- All new public pages are in the sitemap and covered by the confidentiality and accessibility tests.

## Consequences

- Authors are linked by name, so a profile's name must match how it is written in author lists.
- The main navigation has seven links; it still fits from 1024px wide.
