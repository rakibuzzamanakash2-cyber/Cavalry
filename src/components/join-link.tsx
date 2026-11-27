import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { isMemberRole } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";

type JoinLinkProps = {
  className: string;
  /** Link text for visitors and signed-in people who aren't members yet. */
  children: ReactNode;
  /** What members see instead (they already have membership). null shows nothing. */
  memberLabel?: ReactNode | null;
};

/**
 * "Apply" / "Work with us" links. Members already belong, so they get a link to
 * the workspace instead, or nothing. Reads the session, so it streams in; the
 * placeholder holds the space without flashing the wrong link.
 */
export function JoinLink(props: JoinLinkProps) {
  return (
    <Suspense
      fallback={
        <span aria-hidden className={`${props.className} invisible`}>
          {props.children}
        </span>
      }
    >
      <JoinLinkInner {...props} />
    </Suspense>
  );
}

async function JoinLinkInner({
  className,
  children,
  memberLabel = "Open the workspace",
}: JoinLinkProps) {
  const user = await getCurrentUser();
  if (user && isMemberRole(user.role)) {
    if (memberLabel === null) return null;
    return (
      <Link href="/workspace" className={className}>
        {memberLabel}
      </Link>
    );
  }
  return (
    <Link href="/apply" className={className}>
      {children}
    </Link>
  );
}
