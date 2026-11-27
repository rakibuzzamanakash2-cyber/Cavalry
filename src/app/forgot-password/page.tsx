import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotClient } from "@/components/auth/forgot-client";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

// Password reset, step by step as in Ru'sAuth: email, code, new password.
export default function Page() {
  return (
    <AuthCard title="Forgot password">
      <ForgotClient />
    </AuthCard>
  );
}
