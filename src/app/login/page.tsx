import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginClient } from "@/components/auth/login-client";
import { googleSignInEnabled } from "@/lib/auth";
import { safeNext } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Login", robots: { index: false } };

// Ported from Ru'sAuth (src/app/(forms)/login/page.tsx).
export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard title="Login">
      <Suspense fallback={<p className="py-8 text-center text-sm">Loading…</p>}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = safeNext((await searchParams).next);
  return <LoginClient next={next} googleEnabled={googleSignInEnabled} />;
}
