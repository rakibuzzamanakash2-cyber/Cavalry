import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { NewPasswordClient } from "@/components/auth/new-password-client";

export const metadata: Metadata = { title: "New password", robots: { index: false } };

// Password reset, step by step as in Ru'sAuth: email, code, new password.
export default function Page() {
  return (
    <AuthCard title="New password">
      <NewPasswordClient />
    </AuthCard>
  );
}
