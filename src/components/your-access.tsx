import Link from "next/link";
import { accessLevelInfo, nextStep, type AccessLevel } from "@/content/access";
import type { Role } from "@/lib/roles";
import { AccessTable } from "./access-table";

export function levelOf(role: Role | null | undefined): AccessLevel {
  if (!role) return "visitor";
  if (role === "admin") return "admin";
  if (role === "member") return "member";
  return "user";
}

/** The viewer's access level, what it opens up and how to get more. */
export function YourAccess({ role, showTable = true }: { role: Role | null; showTable?: boolean }) {
  const level = levelOf(role);
  const info = accessLevelInfo[level];
  const step = nextStep[level];
  return (
    <section aria-labelledby="your-access" className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="your-access" className="text-2xl">
          Your access
        </h2>
        <p
          className="text-accent-strong tracking-caps text-xs uppercase"
          data-testid="access-level"
        >
          {info.name}
        </p>
      </div>
      <p className="text-muted leading-relaxed">
        {info.who}{" "}
        {step ? (
          <>
            {step}{" "}
            {level === "visitor" ? (
              <Link href="/registration" className="text-ink hover:text-accent underline">
                Create an account
              </Link>
            ) : (
              <Link href="/apply" className="text-ink hover:text-accent underline">
                Apply to join
              </Link>
            )}
          </>
        ) : null}
      </p>
      {showTable ? <AccessTable highlight={level} /> : null}
    </section>
  );
}
