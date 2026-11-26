# ADR 0014 — Typography and homepage structure

- Status: Accepted (replaces the font choices in ADR 0012 and the one-screen homepage)
- Date: 2026-11-27
- Deciders: Rakib, Rubayet

## Context

We reviewed leading research organisations' sites (Council on Foreign Relations, Our World in Data, J-PAL, CGD, RAND, IFPRI, Epoch AI) and a 2026 review of the best think-tank websites. Common patterns: a classic serif for headlines with a clean sans for the interface (CFR: Caslon + DM Sans; Our World in Data: Playfair + Lato); sparing colour; the mission in one plain sentence; lean navigation; content grouped by topic; a clear account of how the work is done. Our display serif (Cormorant Garamond) was hard to read below headline sizes, labels used very wide letter-spacing, and the one-screen homepage left no room for these sections and showed "0 completed" counts.

## Decision

- **Type:** Source Serif 4 (with optical sizes) for all headings and display text; Inter for interface and body text. Cormorant is removed (the logo is an image). Label letter-spacing drops from 0.28em to 0.12em. Navigation and buttons use sentence case instead of spaced capitals. `.prose-measure` caps long-form lines at about 68 characters.
- **Navigation order:** Research, Publications, News, Team, About, Contact.
- **Homepage:** a scrolling page in five parts: (1) above the fold, the logo, a one-sentence mission and two actions, with a "Where we are" panel showing how every programme runs (or finished work once there is some); (2) research areas; (3) how we work, with the four principles; (4) latest public news, shown only when there is some; (5) a "Work with us" band. The first part must fit a laptop screen without scrolling (tested).
- **Footer:** columns for research areas, organisation and contact.
- The standard programme stages move to `src/content/research.ts` (`programmeProcess`) so the homepage and research page share them.

## Consequences

- No more "0 completed programmes" on the homepage; finished work replaces the "Where we are" panel automatically when it exists.
- Next: topic hub pages for each research area, a "How we work" page and personal profile pages (PR 2).
