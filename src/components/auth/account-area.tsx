import Link from "next/link";
import { countPendingApplications } from "@/data/applications";
import { getCurrentUser } from "@/lib/session";
import { AccountMenu } from "./account-menu";

/** Header account controls (desktop). Reads the session, so render it inside <Suspense>. */
export async function AccountArea() {
  const user = await getCurrentUser();
  if (!user) return <SignInLink />;
  const pending = await countPendingApplications(user);
  return (
    <AccountMenu
      name={user.name}
      email={user.email}
      uid={user.uid}
      role={user.role}
      pendingApplications={pending}
      variant="desktop"
    />
  );
}

/** Shown when signed out, and as the loading placeholder. */
export function SignInLink() {
  return (
    <Link
      href="/sign-in"
      className="border-primary text-primary hover:bg-sand border px-3 py-1.5 text-sm font-medium transition-colors"
    >
      Sign in
    </Link>
  );
}
