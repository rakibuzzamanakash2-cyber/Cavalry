// Who can see what on the CAVALRY site (ADR 0019). This is a description for
// people; the rules themselves are enforced in src/lib/session.ts,
// src/lib/project-access.ts and the data getters, and e2e/access-levels.spec.ts
// checks that the two agree.

export const ACCESS_LEVELS = ["visitor", "user", "member", "admin"] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export const accessLevelInfo: Record<AccessLevel, { name: string; who: string }> = {
  visitor: { name: "Visitor", who: "Anyone, without signing in." },
  user: {
    name: "Signed-in user",
    who: "Anyone with an account who is not a member yet.",
  },
  member: {
    name: "Member",
    who: "Joined through an approved application or a project leader's invite.",
  },
  admin: { name: "Admin", who: "Runs the site: CAVALRY's founders." },
};

/** yes: full access · team: only on projects they belong to · basic: title, leader and stage only · no */
export type Access = "yes" | "no" | "team" | "basic";

export const accessMatrix: {
  area: string;
  detail: string;
  access: Record<AccessLevel, Access>;
}[] = [
  {
    area: "Public site",
    detail: "About, research areas, how we work, team profiles, contact",
    access: { visitor: "yes", user: "yes", member: "yes", admin: "yes" },
  },
  {
    area: "Finished work",
    detail: "Published papers, public datasets, completed programmes, public news",
    access: { visitor: "yes", user: "yes", member: "yes", admin: "yes" },
  },
  {
    area: "Your account",
    detail: "Account ID, username, and applying to join with its status",
    access: { visitor: "no", user: "yes", member: "yes", admin: "yes" },
  },
  {
    area: "Research workspace",
    detail: "Members' news, work in preparation, the project list",
    access: { visitor: "no", user: "no", member: "yes", admin: "yes" },
  },
  {
    area: "Project details",
    detail: "Plan, results, datasets and team of a project in progress",
    access: { visitor: "no", user: "no", member: "team", admin: "yes" },
  },
  {
    area: "Other projects",
    detail: "Projects you are not on",
    access: { visitor: "no", user: "no", member: "basic", admin: "yes" },
  },
  {
    area: "Team directory and ratings",
    detail: "Every member, their projects and ratings",
    access: { visitor: "no", user: "no", member: "yes", admin: "yes" },
  },
  {
    area: "Shared datasets",
    detail: "Links to raw data used across projects",
    access: { visitor: "no", user: "no", member: "yes", admin: "yes" },
  },
  {
    area: "Administration",
    detail: "Users and roles, applications, publishing, subscribers",
    access: { visitor: "no", user: "no", member: "no", admin: "yes" },
  },
];

export const accessLabel: Record<Access, string> = {
  yes: "Yes",
  no: "No",
  team: "Own projects",
  basic: "Title and stage only",
};

/** What a level adds over the one before it, for the "Your access" panel. */
export const nextStep: Record<AccessLevel, string | null> = {
  visitor: "Create an account to apply to join.",
  user: "Members join through an approved application or a project leader's invite.",
  member: null,
  admin: null,
};
