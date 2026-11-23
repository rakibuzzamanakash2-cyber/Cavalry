# ADR 0004 — Projects, teams and invites

- Status: Accepted
- Date: 2026-11-23
- Deciders: Rakib, Rubayet

## Context

Members need to start research projects and work on them in small teams. Research in progress is confidential, including between members: someone who is not on a project should not read its plans. Team leaders need to bring in people, including people who are not members yet.

## Decision

- **Any member can open a project** and becomes its team leader (`projects.leader_id`). The leader is also on the team.
- **Team membership** lives in `project_memberships` (project, user, free-text role, joined date), one row per person per project. Roles are names the leader types, such as "Data engineer"; there is no fixed list.
- **Who sees what**, decided in one place (`src/lib/project-access.ts`):
  - every member: that a project exists — title, number, leader, team size, stage;
  - the project's team and admins: the full project (question, design, data, roadmap) and the team list;
  - the leader and admins: manage the team — add members, change roles, remove people, hand over leadership, create and revoke invites.
- **Invites** are one-time links valid for 7 days. Only a SHA-256 hash of the token is stored, so the database never holds a usable link; the link is shown once when created. Accepting needs a signed-in account, claims the invite atomically (so a link works once), makes a plain `user` a `member`, and adds them to the project with the invite's role. The invite page shows only the project title, the role and who sent it.
- Every server action re-checks permissions on the server; forms only send ids, which are validated before any query.
- The old members-wide `/workspace/research/<slug>` page is replaced by `/workspace/projects/<slug>`.

## Consequences

- An admin can read every project; a member can read only projects they are on.
- The seed makes the first existing admin from `ADMIN_EMAILS` the leader of a seeded programme that has no leader, so its team can be managed.
- Per-project ratings (step 4) attach to `project_memberships`; the team pages and datasets come next.
- Invite links are bearer tokens: anyone holding an unused link can join. Leaders should send them privately and revoke unused ones.
