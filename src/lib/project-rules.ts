// Project team rules shared by pages, actions and tests (ADR 0011).

/** Every project starts with this many team slots… */
export const SLOTS_START = 5;
/** …and can grow to at most this many, with an admin's approval. */
export const SLOTS_MAX = 10;

export type Position = "leader" | "co_leader" | "member";

export const positionLabel: Record<Position, string> = {
  leader: "Leader",
  co_leader: "Co-leader",
  member: "Member",
};
