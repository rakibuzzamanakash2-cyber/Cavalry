"use client";

import { useActionState } from "react";
import { ui } from "@/components/ui";
import { unsubscribe, type UnsubscribeState } from "../actions";

// A button rather than an automatic unsubscribe, so link scanners in email
// apps can't unsubscribe people by opening the link.
export function UnsubscribeForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<UnsubscribeState, FormData>(unsubscribe, null);
  if (state?.ok) {
    return (
      <p role="status" className="text-lg">
        {state.message}
      </p>
    );
  }
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <button type="submit" disabled={pending} className={ui.button}>
        {pending ? "Unsubscribing…" : "Unsubscribe"}
      </button>
      {state ? (
        <p role="alert" className="text-accent-strong text-sm">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
