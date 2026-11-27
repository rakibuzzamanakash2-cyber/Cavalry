"use client";

// Ported from Ru'sAuth (src/app/component/GoogleButton.tsx). Ru'sAuth runs its
// own OAuth routes; here Better Auth handles the Google redirect and callback.

import Image from "next/image";
import { useState } from "react";
import google from "@/assets/google.png";
import { authClient } from "@/lib/auth-client";
import { useToastStore } from "@/components/toast/toast-store";
import { secondaryButtonClass } from "./form-styles";

export function GoogleButton({
  disabled,
  next,
  from,
}: {
  disabled?: boolean;
  /** Where to go after signing in. */
  next: string;
  /** The page the button is on, so errors come back to it. */
  from: "/login" | "/registration";
}) {
  const addToast = useToastStore((s) => s.addToast);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: next,
      // New accounts see the welcome page first.
      newUserCallbackURL: `/welcome?next=${encodeURIComponent(next)}`,
      errorCallbackURL: `${from}?error=auth_failed`,
    });
    if (result?.error) {
      addToast(result.error.message ?? "Google sign-in failed. Please try again.", "error");
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={handleClick}
      className={secondaryButtonClass}
    >
      <Image src={google} alt="" className="h-5 w-5" />
      <span className="leading-none">{pending ? "Opening Google…" : "Continue with Google"}</span>
    </button>
  );
}
