"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  next: string;
  googleEnabled: boolean;
};

const inputClass =
  "border-line bg-surface text-ink focus:border-accent mt-1 block w-full border px-3 py-2.5 outline-none transition-colors";

export function AuthForm({ mode, next, googleEnabled }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isSignUp = mode === "sign-up";

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    startTransition(async () => {
      const result = isSignUp
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(
          result.error.message ??
            (isSignUp ? "Could not create the account." : "Email or password is incorrect."),
        );
        return;
      }
      router.push(next);
      router.refresh();
    });
  }

  function onGoogle() {
    setError(null);
    startTransition(async () => {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: next });
      if (result?.error) setError(result.error.message ?? "Google sign-in failed.");
    });
  }

  return (
    <div className="space-y-6">
      {googleEnabled ? (
        <>
          <button
            type="button"
            onClick={onGoogle}
            disabled={pending}
            className="border-primary text-primary hover:border-accent hover:text-accent flex w-full items-center justify-center gap-3 border px-5 py-3 text-sm transition-colors disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
              <path
                fill="currentColor"
                d="M21.35 11.1H12v2.98h5.36c-.23 1.5-1.68 4.4-5.36 4.4a5.96 5.96 0 0 1 0-11.92c1.85 0 3.1.79 3.8 1.47l2.6-2.5C16.76 3.98 14.6 3 12 3a9 9 0 1 0 0 18c5.2 0 8.64-3.65 8.64-8.8 0-.6-.07-1.05-.15-1.5Z"
              />
            </svg>
            Continue with Google
          </button>
          <p className="text-muted tracking-caps flex items-center gap-3 text-xs uppercase">
            <span className="bg-line h-px flex-1" />
            or with email
            <span className="bg-line h-px flex-1" />
          </p>
        </>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
        {isSignUp ? (
          <label className="block">
            <span className="text-muted tracking-caps text-xs uppercase">Full name</span>
            <input name="name" required autoComplete="name" className={inputClass} />
          </label>
        ) : null}
        <label className="block">
          <span className="text-muted tracking-caps text-xs uppercase">Email</span>
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </label>
        <label className="block">
          <span className="text-muted tracking-caps text-xs uppercase">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className={inputClass}
          />
          {isSignUp ? (
            <span className="text-muted mt-1 block text-xs">At least 8 characters.</span>
          ) : null}
        </label>

        {error ? (
          <p role="alert" className="border-accent text-accent-strong border-l-2 pl-3 text-sm">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground hover:bg-accent tracking-caps w-full px-5 py-3.5 text-xs uppercase transition-colors disabled:opacity-60"
        >
          {pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="text-muted text-sm">
        {isSignUp ? "Already have an account? " : "New here? "}
        <Link
          href={`${isSignUp ? "/sign-in" : "/sign-up"}?next=${encodeURIComponent(next)}`}
          className="text-ink hover:text-accent underline transition-colors"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
