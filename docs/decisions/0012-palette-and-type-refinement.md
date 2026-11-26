# ADR 0012 — Chart palette, reading background and a text serif

- Status: Accepted
- Date: 2026-11-26
- Deciders: Rakib, Rubayet

## Context

A review of leading research organisations' sites (J-PAL, CGD, RAND, IFPRI, Our World in Data, Epoch AI) showed that CAVALRY's restrained ink, parchment and oxblood palette already fits the genre. Three gaps remained: no colours for charts and categories, a background that is tiring for long reading, and a display serif (Cormorant Garamond) that gets hard to read at small heading sizes.

## Decision

- Keep the brand palette (ink, parchment, oxblood, sand, muted, line).
- Add five chart/category colours in a fixed order: oxblood, deep teal, ochre, slate blue, warm gray (`--chart-1` … `--chart-5`, with dark-mode versions). They are for fills and rules only, never text. A category keeps its colour everywhere: each research area has a `tone` (public finance = oxblood, climate & disaster risk = teal, causal inference = ochre, machine learning for policy = slate).
- Add a lighter `--paper` background for long-form pages (programme articles, news posts).
- Use Source Serif 4 for `h3`; Cormorant Garamond stays for `h1`/`h2` and display text.

## Consequences

- Future charts use `--chart-*` in order; more than five series fold into "Other" (warm gray) or small multiples.
- One extra font file is loaded.
