"use client";

// Ported from Ru'sAuth (src/app/(forms)/forgot-password/ForgotClient.tsx).

import { Mail } from "@mynaui/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToastStore } from "@/components/toast/toast-store";
import { authClient } from "@/lib/auth-client";
import { EMAIL_MAX_LENGTH, isValidEmail, normalizeEmail } from "@/lib/validation";
import { IconField } from "./form-fields";
import { linkClass, primaryButtonClass } from "./form-styles";
import { writeResetFlow } from "./reset-flow";

export function ForgotClient() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const email = normalizeEmail(String(new FormData(event.currentTarget).get("email") ?? ""));
    if (!email) return addToast("Please enter your email address.", "error");
    if (!isValidEmail(email)) return addToast("Please enter a valid email address.", "error");

    setIsPending(true);
    try {
      const result = await authClient.emailOtp.requestPasswordReset({ email });
      if (result.error) {
        addToast(
          result.error.status === 429
            ? "Too many requests. Please wait a minute and try again."
            : (result.error.message ?? "Could not send the code. Please try again."),
          "error",
        );
        return;
      }
      // The same reply whether or not the email has an account.
      writeResetFlow({ email });
      addToast("If that email has an account, we've sent it a reset code.", "success");
      router.replace("/otp-verification");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">No worries, reset your password.</p>
        <p className="text-muted text-sm">Enter your email to receive a password reset code.</p>
      </div>
      <IconField
        icon={Mail}
        label="Email"
        type="email"
        name="email"
        placeholder="Enter email"
        autoComplete="email"
        maxLength={EMAIL_MAX_LENGTH}
        required
      />
      <button type="submit" disabled={isPending} className={`mt-2 ${primaryButtonClass}`}>
        <span className="leading-none">{isPending ? "Sending code…" : "Send code"}</span>
      </button>
      <div className="mt-2 flex justify-center">
        <Link href="/login" className={linkClass}>
          Back to login
        </Link>
      </div>
    </form>
  );
}
