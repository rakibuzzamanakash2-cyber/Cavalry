"use client";

// Ported from Ru'sAuth (src/app/(forms)/registration/RegistrationClient.tsx).
// Ru'sAuth sends a 6-digit code next; CAVALRY creates the account straight
// away, emails a confirmation and shows the welcome page.

import { At, Mail, User } from "@mynaui/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToastStore } from "@/components/toast/toast-store";
import { authClient } from "@/lib/auth-client";
import { normalizeUsername, usernameProblem } from "@/lib/identity";
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_BYTES,
  PASSWORD_MIN_LENGTH,
  getNameError,
  getPasswordError,
  isValidEmail,
  normalizeEmail,
} from "@/lib/validation";
import { IconField, PasswordField } from "./form-fields";
import { linkClass, primaryButtonClass } from "./form-styles";
import { GoogleButton } from "./google-button";
import { OrDivider } from "./or-divider";
import { useOAuthError } from "./use-oauth-error";

export function RegistrationClient({
  next,
  googleEnabled,
}: {
  next: string;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [isPending, setIsPending] = useState(false);

  useOAuthError();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const username = normalizeUsername(String(formData.get("username") ?? ""));
    const email = normalizeEmail(String(formData.get("email") ?? ""));
    const password = String(formData.get("password") ?? "");

    if (!name || !username || !email || !password) {
      addToast("Name, username, email and password are required.", "error");
      return;
    }
    const nameError = getNameError(name);
    if (nameError) return addToast(nameError, "error");
    const usernameError = usernameProblem(username);
    if (usernameError) return addToast(`Username: ${usernameError}`, "error");
    if (!isValidEmail(email)) return addToast("Please enter a valid email address.", "error");
    const passwordError = getPasswordError(password);
    if (passwordError) return addToast(passwordError, "error");

    setIsPending(true);
    try {
      const result = await authClient.signUp.email({ name, email, password, username });
      if (result.error) {
        addToast(result.error.message ?? "Could not create the account.", "error");
        return;
      }
      addToast("Account created successfully.", "success");
      router.replace(`/welcome?next=${encodeURIComponent(next)}`);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-muted text-sm">Enter your information to register.</p>

      <IconField
        icon={User}
        label="Full name"
        type="text"
        name="name"
        placeholder="Enter full name"
        autoComplete="name"
        minLength={NAME_MIN_LENGTH}
        maxLength={NAME_MAX_LENGTH}
        required
      />
      <IconField
        icon={At}
        label="Username"
        type="text"
        name="username"
        placeholder="Choose a username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        minLength={3}
        maxLength={30}
        hint="Lowercase letters, numbers, dots or underscores. You can sign in with it."
        required
      />
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
      <PasswordField
        name="password"
        placeholder="Enter password (minimum 8 characters)"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        maxLength={PASSWORD_MAX_BYTES}
        required
      />

      <button type="submit" disabled={isPending} className={`mt-2 ${primaryButtonClass}`}>
        <span className="leading-none">{isPending ? "Creating account…" : "Sign up"}</span>
      </button>

      {googleEnabled ? (
        <>
          <OrDivider className="mt-2" />
          <GoogleButton disabled={isPending} next={next} from="/registration" />
        </>
      ) : null}

      <p className="text-muted mt-2 text-center text-sm">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className={linkClass}>
          Login
        </Link>
      </p>
    </form>
  );
}
