"use client";

// Ported from Ru'sAuth (src/lib/useOAuthError.ts): shows a toast when Google
// sends the user back with ?error=…, then tidies the address.

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToastStore } from "@/components/toast/toast-store";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_session: "Your session expired. Please try again.",
  auth_failed: "Could not verify your Google account. Please try again.",
  access_denied: "Google sign-in was cancelled.",
};

export function useOAuthError(): void {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const addToast = useToastStore((s) => s.addToast);
  const oauthError = params.get("error");

  useEffect(() => {
    if (!oauthError) return;
    addToast(OAUTH_ERROR_MESSAGES[oauthError] ?? "An unexpected error occurred.", "error");
    const rest = new URLSearchParams(params);
    rest.delete("error");
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [oauthError, pathname, params, addToast, router]);
}
