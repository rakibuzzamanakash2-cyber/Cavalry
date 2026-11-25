# ADR 0011 — Leaders, co-leaders and team slots

- Status: Accepted
- Date: 2026-11-25
- Deciders: Rakib, Rubayet

## Context

Projects need more than one person running them, leadership has to be easy to hand over (including to someone new), everyone, the leader too, should have a clear role, and teams should stay small unless there is a reason to grow.

## Decision

- **Positions:** each project has one **leader** (`projects.leader_id`), any number of **co-leaders** and **members** (`project_memberships.position`). Everyone also has a free-text **role** ("Principal investigator", "Data engineer"); the person who opens a project gives their own role.
- **Who can do what** (`src/lib/project-access.ts`):
  - leader and admins (`canManage`): everything, including making someone co-leader or leader, rating, and adding or inviting someone as co-leader or leader;
  - co-leaders (`canRunTeam`): add and remove members, change members' roles, create and revoke member invites, edit the research plan;
  - members: read.
    Nobody can remove the leader; hand over leadership first.
- **Handing over:** the leader or an admin can make any team member the leader, add an existing member straight in as leader, or create an invite whose position is leader. The previous leader stays on the team as a member and keeps their role.
- **Slots:** a project starts with 5 and can have at most 10. People on the team and open invites each use one, so an invite can always be accepted. Adding or inviting stops when no slot is free.
- **More slots:** only the leader can ask (`project_slot_requests`), one request at a time, with a reason. Admins approve or decline at `/admin/slot-requests`; approval adds the slots, never past 10. Admins can also set a project's slots directly, never below what is in use.
- Existing projects with more than 5 people were given enough slots for them by the migration.

## Consequences

- The project list shows "N of M slots filled".
- If a newly created invite takes the last slot, its link stays on screen so it isn't lost.
