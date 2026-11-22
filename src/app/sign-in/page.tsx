import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { googleSignInEnabled } from "@/lib/auth";
import { safeNext } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <AuthShell
      title="Sign in"
      intro="Members sign in to reach the research workspace. Anyone can sign in to apply to work with us."
    >
      <Suspense fallback={null}>
        <SignInForm searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function SignInForm({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = safeNext((await searchParams).next);
  return <AuthForm mode="sign-in" next={next} googleEnabled={googleSignInEnabled} />;
}
