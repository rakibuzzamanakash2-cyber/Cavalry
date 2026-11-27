"use client";

// Ported from Ru'sAuth (src/app/(forms)/otp-verification/OTPClient.tsx), for
// the password-reset code.

import { Password, Refresh } from "@mynaui/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useToastStore } from "@/components/toast/toast-store";
import { authClient } from "@/lib/auth-client";
import { IconField } from "./form-fields";
import { linkClass, primaryButtonClass, secondaryButtonClass } from "./form-styles";
import { readResetFlow, resetErrorMessage, writeResetFlow, type ResetFlow } from "./reset-flow";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export function OtpClient() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [flow, setFlow] = useState<ResetFlow | null | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    // sessionStorage is only readable in the browser, after the first render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlow(readResetFlow());
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (flow === undefined) return <p className="py-8 text-center text-sm">Loading…</p>;
  if (flow === null) return <RestartNotice />;
  const email = flow.email;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || isResending) return;
    const otp = String(new FormData(event.currentTarget).get("otp") ?? "").trim();
    if (!/^\d{6}$/.test(otp)) return addToast("Enter the six-digit code.", "error");

    setIsPending(true);
    try {
      const result = await authClient.emailOtp.checkVerificationOtp({
        email,
        otp,
        type: "forget-password",
      });
      if (result.error) {
        addToast(resetErrorMessage(result.error), "error");
        return;
      }
      writeResetFlow({ email, otp });
      addToast("Code verified. Choose a new password.", "success");
      router.replace("/new-password");
    } finally {
      setIsPending(false);
    }
  }

  async function handleResend() {
    if (isPending || isResending || cooldown > 0) return;
    setIsResending(true);
    try {
      const result = await authClient.emailOtp.requestPasswordReset({ email });
      if (result.error) {
        addToast(
          result.error.status === 429
            ? "Too many requests. Please wait a minute and try again."
            : (result.error.message ?? "Could not send a new code."),
          "error",
        );
        return;
      }
      addToast("A new code is on its way.", "success");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-muted text-sm leading-relaxed">
        If <span className="text-ink font-medium break-all">{email}</span> has an account, we sent
        it a 6-digit code. Check your inbox or spam folder.
      </p>
      <IconField
        icon={Password}
        label="Reset code"
        inputClassName="tracking-wider"
        type="text"
        name="otp"
        placeholder="Enter 6-digit code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={OTP_LENGTH}
        required
        onInput={(e) => {
          e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
        }}
      />
      <button
        type="submit"
        disabled={isPending || isResending}
        className={`mt-1 ${primaryButtonClass}`}
      >
        <span className="leading-none">{isPending ? "Verifying…" : "Verify code"}</span>
      </button>
      <button
        type="button"
        onClick={handleResend}
        disabled={isPending || isResending || cooldown > 0}
        className={secondaryButtonClass}
      >
        <Refresh size={16} stroke={1.5} />
        <span className="leading-none">
          {isResending ? "Resending…" : cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
        </span>
      </button>
      <div className="mt-2 flex justify-center">
        <Link href="/forgot-password" className={linkClass}>
          Use a different email
        </Link>
      </div>
    </form>
  );
}

export function RestartNotice() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted text-sm leading-relaxed">
        This step needs the email you started with. Please start the reset again.
      </p>
      <Link href="/forgot-password" className={primaryButtonClass}>
        Start again
      </Link>
    </div>
  );
}
