// Names for access levels, used to tell people their own level. The full map
// of who can see what is deliberately not shown on the site (ADR 0019); the
// rules live in src/lib/session.ts, src/lib/project-access.ts and the data
// getters, and e2e/access-levels.spec.ts checks them.

export type AccessLevel = "visitor" | "user" | "member" | "admin";

export const accessLevelInfo: Record<AccessLevel, { name: string; who: string }> = {
  visitor: { name: "Visitor", who: "You're not signed in." },
  user: { name: "Signed-in user", who: "You have an account but aren't a member yet." },
  member: { name: "Member", who: "You can use the research workspace." },
  admin: { name: "Admin", who: "You can run the site." },
};

/** How to go further from a level, if there is a way. */
export const nextStep: Record<AccessLevel, string | null> = {
  visitor: "Create an account to apply to join.",
  user: "Members join through an approved application or a project leader's invite.",
  member: null,
  admin: null,
};
