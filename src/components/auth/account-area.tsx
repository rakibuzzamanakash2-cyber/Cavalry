import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { AccountMenu } from "./account-menu";

/** Header account controls (desktop). Reads the session, so render it inside <Suspense>. */
export async function AccountArea() {
  const user = await getCurrentUser();
  if (!user) return <SignInLink />;
  return <AccountMenu name={user.name} email={user.email} role={user.role} variant="desktop" />;
}

/** Shown when signed out, and as the loading placeholder. */
export function SignInLink() {
  return (
    <Link
      href="/sign-in"
      className="border-primary text-primary hover:border-accent hover:text-accent tracking-caps border px-3 py-1.5 text-xs uppercase transition-colors"
    >
      Sign in
    </Link>
  );
}
