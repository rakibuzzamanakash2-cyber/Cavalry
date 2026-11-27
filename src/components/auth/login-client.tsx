"use client";

// Ported from Ru'sAuth (src/app/(forms)/login/LoginClient.tsx). Ru'sAuth calls
// its own /api/auth/login; here Better Auth signs the user in. The first field
// takes an email, a username or an account ID (CAV00012).

import { Mail } from "@mynaui/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToastStore } from "@/components/toast/toast-store";
import { authClient } from "@/lib/auth-client";
import { EMAIL_MAX_LENGTH } from "@/lib/validation";
import { IconField, PasswordField } from "./form-fields";
import { linkClass, primaryButtonClass } from "./form-styles";
import { GoogleButton } from "./google-button";
import { OrDivider } from "./or-divider";
import { useOAuthError } from "./use-oauth-error";

export function LoginClient({ next, googleEnabled }: { next: string; googleEnabled: boolean }) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [isPending, setIsPending] = useState(false);

  useOAuthError();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!identifier || !password) {
      addToast("Please enter your email, username or ID and your password.", "error");
      return;
    }

    setIsPending(true);
    try {
      const result = await authClient.signIn.email({ email: identifier, password });
      if (result.error) {
        const code = (result.error as { code?: string }).code;
        addToast(
          code === "INVALID_EMAIL_OR_PASSWORD" || code === "INVALID_EMAIL"
            ? "Those sign-in details don't match an account. Check them and try again."
            : (result.error.message ?? "Could not sign you in. Please try again."),
          "error",
        );
        return;
      }
      addToast("Logged in successfully.", "success");
      router.replace(next);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-muted text-sm">
        Enter your email, username or ID and your password to log in.
      </p>

      <div className="flex flex-col gap-4">
        <IconField
          icon={Mail}
          label="Email, username or ID"
          type="text"
          name="identifier"
          placeholder="Email, username or ID"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={EMAIL_MAX_LENGTH}
          hint="Your ID looks like CAV00012. Find it on your account page."
          required
        />
        <div className="flex flex-col gap-2">
          <PasswordField
            name="password"
            placeholder="Enter password"
            autoComplete="current-password"
            required
          />
          <Link href="/forgot-password" className={`mt-2 self-center ${linkClass}`}>
            Forgot password?
          </Link>
        </div>
      </div>

      <button type="submit" disabled={isPending} className={primaryButtonClass}>
        <span className="leading-none">{isPending ? "Authenticating…" : "Login"}</span>
      </button>

      {googleEnabled ? (
        <>
          <OrDivider />
          <GoogleButton disabled={isPending} next={next} from="/login" />
        </>
      ) : null}

      <p className="text-muted mt-2 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href={`/registration?next=${encodeURIComponent(next)}`} className={linkClass}>
          Sign up
        </Link>
      </p>
    </form>
  );
}
