"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toRole } from "@/lib/roles";
import { AccountMenu } from "./account-menu";

/**
 * Account section of the phone menu. The menu only renders while open, so the
 * session is fetched in the browser at that point rather than on the server.
 */
export function MobileAccount() {
  const { data, isPending } = authClient.useSession();

  if (isPending) return <div className="border-line mt-6 h-16 border-t" aria-hidden />;

  if (!data) {
    return (
      <div className="border-line mt-6 border-t pt-6">
        <Link
          href="/login"
          className="bg-primary text-primary-foreground hover:bg-accent tracking-caps block px-5 py-3.5 text-center text-xs uppercase transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const user = data.user as typeof data.user & { role?: unknown };
  return (
    <AccountMenu
      name={user.name}
      email={user.email}
      uid={String((user as { uid?: unknown }).uid ?? "")}
      role={toRole(user.role)}
      variant="mobile"
    />
  );
}
