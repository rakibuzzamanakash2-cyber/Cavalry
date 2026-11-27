import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { OtpClient } from "@/components/auth/otp-client";

export const metadata: Metadata = { title: "Enter your code", robots: { index: false } };

// Password reset, step by step as in Ru'sAuth: email, code, new password.
export default function Page() {
  return (
    <AuthCard title="Enter your code">
      <OtpClient />
    </AuthCard>
  );
}
