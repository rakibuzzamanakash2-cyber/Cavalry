"use client";

// Ported from Ru'sAuth (src/app/(forms)/new-password/NewClient.tsx).

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useToastStore } from "@/components/toast/toast-store";
import { authClient } from "@/lib/auth-client";
import { PASSWORD_MAX_BYTES, PASSWORD_MIN_LENGTH, getPasswordError } from "@/lib/validation";
import { PasswordField } from "./form-fields";
import { primaryButtonClass } from "./form-styles";
import { RestartNotice } from "./otp-client";
import { clearResetFlow, readResetFlow, resetErrorMessage, type ResetFlow } from "./reset-flow";

export function NewPasswordClient() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [flow, setFlow] = useState<ResetFlow | null | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    // sessionStorage is only readable in the browser, after the first render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlow(readResetFlow());
  }, []);

  if (flow === undefined) return <p className="py-8 text-center text-sm">Loading…</p>;
  if (!flow?.otp) return <RestartNotice />;
  const { email, otp } = flow;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (!newPassword || !confirmPassword) {
      return addToast("Both password fields are required.", "error");
    }
    const passwordError = getPasswordError(newPassword);
    if (passwordError) return addToast(passwordError, "error");
    if (newPassword !== confirmPassword) return addToast("The passwords do not match.", "error");

    setIsPending(true);
    try {
      const result = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password: newPassword,
      });
      if (result.error) {
        addToast(resetErrorMessage(result.error), "error");
        return;
      }
      clearResetFlow();
      addToast("Password changed. Log in with your new password.", "success");
      router.replace("/login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-muted text-sm">Enter your new password here.</p>
      <div className="flex flex-col gap-4">
        <PasswordField
          name="newPassword"
          label="New password"
          placeholder="Enter new password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_BYTES}
          showLabel="Show new password"
          hideLabel="Hide new password"
          required
        />
        <PasswordField
          name="confirmPassword"
          label="Confirm new password"
          placeholder="Confirm new password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_BYTES}
          showLabel="Show confirmation password"
          hideLabel="Hide confirmation password"
          required
        />
      </div>
      <button type="submit" disabled={isPending} className={`mt-2 ${primaryButtonClass}`}>
        <span className="leading-none">{isPending ? "Changing password…" : "Change password"}</span>
      </button>
      <p className="text-muted mt-1 text-center text-xs leading-relaxed">
        Note: you will be logged out from all devices after changing your password.
      </p>
    </form>
  );
}
