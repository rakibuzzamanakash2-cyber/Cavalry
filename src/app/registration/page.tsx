import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { RegistrationClient } from "@/components/auth/registration-client";
import { googleSignInEnabled } from "@/lib/auth";
import { safeNext } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Sign up", robots: { index: false } };

// Ported from Ru'sAuth (src/app/(forms)/registration/page.tsx).
export default function RegistrationPage({ searchParams }: PageProps<"/registration">) {
  return (
    <AuthCard title="Sign up">
      <Suspense fallback={<p className="py-8 text-center text-sm">Loading…</p>}>
        <RegistrationForm searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function RegistrationForm({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = safeNext((await searchParams).next);
  return <RegistrationClient next={next} googleEnabled={googleSignInEnabled} />;
}
