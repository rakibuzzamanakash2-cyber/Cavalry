import type { Tier } from "./people";

// Small role labels shown next to names in people lists.
const base = "border px-1.5 py-0.5 text-[0.6875rem] leading-none font-medium";
export const tierBadge: Record<Tier, string> = {
  admin: `${base} border-primary bg-primary text-primary-foreground`,
  leader: `${base} border-accent-strong text-accent-strong`,
  member: `${base} border-line text-ink`,
  user: `${base} border-line text-muted`,
};
