import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { googleSignInEnabled } from "@/lib/auth";
import { safeNext } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  return (
    <AuthShell
      title="Create an account"
      intro="An account lets you apply to work with us in a research field. Research in progress is visible to members only."
    >
      <Suspense fallback={null}>
        <SignUpForm searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function SignUpForm({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = safeNext((await searchParams).next);
  return <AuthForm mode="sign-up" next={next} googleEnabled={googleSignInEnabled} />;
}
