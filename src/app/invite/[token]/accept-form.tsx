"use client";

import { useActionState } from "react";
import { ui } from "@/components/ui";
import { acceptInvite, type AcceptState } from "./actions";

export function AcceptForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<AcceptState, FormData>(acceptInvite, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="token" value={token} />
      {state ? (
        <p role="alert" className="border-accent text-accent-strong border-l-2 pl-3 text-sm">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={`${ui.button} w-full sm:w-auto`}>
        {pending ? "Joining…" : "Accept and join the project"}
      </button>
    </form>
  );
}
