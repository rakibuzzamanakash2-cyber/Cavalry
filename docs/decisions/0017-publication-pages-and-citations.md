# ADR 0017 — Publication pages and citations

- Status: Accepted
- Date: 2026-11-27
- Deciders: Rakib, Rubayet

## Context

Research sites give every paper its own page so it can be linked, cited and found by Google Scholar, and they make reuse terms clear. Our publications were a single list with no citation help and no place to record code, data or licence.

## Decision

- Each **published** output has a page at `/publications/<slug>` with the abstract, linked authors, links (read, PDF, DOI, code, data), its licence and a link to its programme when that is public. Work in preparation or under review has no page.
- **Cite this** offers a reference (APA style), BibTeX and RIS, each with a copy button; BibTeX and RIS can also be downloaded. They are built in `src/lib/citation.ts`.
- Pages carry Highwire `citation_*` meta tags for Google Scholar and schema.org `ScholarlyArticle`, `Dataset` or `SoftwareSourceCode` data.
- Publications gain three optional fields edited by admins: code link, data or replication-package link, and licence (CC BY 4.0, CC BY-SA 4.0, CC BY-NC 4.0, CC0, MIT, Apache 2.0 or all rights reserved).
- Publication pages are in the sitemap; titles link to them from the publications list, research area pages and profiles.

## Consequences

- Author names are split on commas, "and" and "&". Names are written in full ("Rowshan Rubayet"); references abbreviate given names automatically.
