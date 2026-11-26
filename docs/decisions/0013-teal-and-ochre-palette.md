# ADR 0013 — Teal and ochre on paper

- Status: Accepted (replaces the brand colours in ADR 0012; its type and paper decisions stand)
- Date: 2026-11-26
- Deciders: Rakib, Rubayet

## Context

After trying the chart palette from ADR 0012, we preferred it as the site's main colours rather than as an addition to ink, parchment and oxblood.

## Decision

- **Light theme:** paper background (`#faf7f1`), deep teal brand for logo, headings and primary buttons (`#1f5c5a`), ochre accent, warm gray for captions and lines, slate blue as a secondary colour, and teal-tinted near-black body text.
- Ochre is used in two strengths. Small text and links use a deepened ochre (`#86600f` / `#6f4f0c`) so they meet WCAG AA on paper and on the sand panels. The bright ochre (`#b07a1f`) is kept for markers, stars and charts.
- **Dark theme:** deep teal-black background (`#0f1918`), cream headings and logo, warm ochre accent (`#d9a548`).
- **Chart/category order:** teal, ochre, slate blue, brick, warm gray. The research areas keep their places (public finance teal, climate & disaster risk ochre, causal inference slate, machine learning for policy brick).
- The favicon and browser theme colours follow the new palette.

## Consequences

- Only `src/app/globals.css` (plus favicon and theme colour) changed; components already use semantic tokens.
