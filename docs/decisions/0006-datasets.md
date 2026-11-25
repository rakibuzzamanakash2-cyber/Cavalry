# ADR 0006 — Datasets section

- Status: Accepted
- Date: 2026-11-25
- Deciders: Rakib, Rubayet

## Context

The team needs one place listing the data the research uses, what each dataset is for and where it lives (usually a GitHub repository or a Google Drive folder). Dataset names and purposes can reveal research in progress, so they follow the same confidentiality rules as projects.

## Decision

- A `datasets` table: name, what it is, what we use it for, an https link, an optional project, who added it, timestamps. The data itself stays on GitHub or Drive; we store only the link.
- **Visibility:** a dataset with no project is shared with every member. A dataset filed under a project is visible only to that project's team and admins, on `/workspace/datasets` and on the project page.
- **Adding:** any member can add a shared dataset, or file one under a project they are on.
- **Editing and deleting:** the person who added it, the project's leader, or an admin.
- Links must be full `https://` URLs (no `javascript:` or other schemes). They open in a new tab with `rel="noopener noreferrer"`. A badge says whether the link is GitHub, Google Drive or another site.
- Deleting a project deletes its dataset entries; deleting a user keeps their entries (the "added by" name is cleared).

## Consequences

- Nothing about datasets appears on the public site.
- Forms on these pages use generated ids (`useId`), because Next keeps the previous page mounted but hidden after a client navigation, and fixed ids would clash.
